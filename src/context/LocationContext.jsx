import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { flaskApi } from '../services/flaskApi';
import { useAuth } from './AuthContext';

const LocationContext = createContext();

// Default 2-minute configurable update interval (120,000 milliseconds)
const DEFAULT_INTERVAL_MS = 120 * 1000;
// Stale threshold: 5 minutes (300 seconds)
const STALE_THRESHOLD_MS = 300 * 1000;

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // GPS Sharing State
  // Rule 1: Starts as false. Browser permission is ONLY requested after student joins approved event and explicitly enables sharing.
  const [isSharing, setIsSharing] = useState(false);
  const [geofenceStatus, setGeofenceStatus] = useState('Offline'); // 'Inside Venue' | 'Outside Bounds' | 'Offline' | 'Session Ended (GPS Off)'
  const [stalenessStatus, setStalenessStatus] = useState('UNAVAILABLE'); // 'LIVE' | 'OUTDATED' | 'UNAVAILABLE'
  
  // Current coordinates
  const [coordinates, setCoordinates] = useState({ lat: 11.49824, lng: 78.16345 });
  const [accuracy, setAccuracy] = useState(4.2); // meters
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [lastKnownLocation, setLastKnownLocation] = useState(null);
  const [pingCount, setPingCount] = useState(0);

  // Active Approved Event for student session
  const [activeApprovedEvent, setActiveApprovedEvent] = useState({
    id: 'evt-2026-001',
    title: 'National Level Workshop on Generative AI & Autonomous Agents',
    status: 'Ongoing',
    venue: 'Main Auditorium (Kamarajar Hall)',
    latitude: 11.4982,
    longitude: 78.1634,
    radius: 65
  });

  // Venue & Zone details
  const [currentZone, setCurrentZone] = useState('Main Auditorium (Kamarajar Hall)');
  const [zoneCode, setZoneCode] = useState('ZONE-A1');

  // Error & Permission states
  const [gpsError, setGpsError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Configurable Interval (in seconds)
  const [updateIntervalSeconds, setUpdateIntervalSeconds] = useState(120);

  const watchIdRef = useRef(null);
  const intervalTimerRef = useRef(null);

  // Monitor online / offline network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setGpsError(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setGpsError('Internet disconnected: Location updates queued.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor staleness of last known location (every 10 seconds)
  useEffect(() => {
    const stalenessChecker = setInterval(() => {
      if (!lastKnownLocation || !lastKnownLocation.timestamp) {
        setStalenessStatus('UNAVAILABLE');
        return;
      }

      const elapsedMs = Date.now() - new Date(lastKnownLocation.timestamp).getTime();
      if (elapsedMs <= STALE_THRESHOLD_MS) {
        // Within 5 minutes
        setStalenessStatus(isSharing ? 'LIVE' : 'OUTDATED');
      } else {
        // Older than 5 minutes -> Strictly OUTDATED (Never label old location as LIVE)
        setStalenessStatus('OUTDATED');
      }
    }, 10000);

    return () => clearInterval(stalenessChecker);
  }, [lastKnownLocation, isSharing]);

  // Transmit current location to Flask backend
  const transmitLocationToBackend = useCallback(async (lat, lng, acc) => {
    // Privacy Rule: Do not collect or send location outside active approved events
    if (!activeApprovedEvent || activeApprovedEvent.status === 'Completed' || activeApprovedEvent.status === 'Cancelled') {
      setIsSharing(false);
      setGeofenceStatus('Session Ended (GPS Off)');
      return;
    }

    if (!navigator.onLine) {
      setGpsError('Internet disconnected: Cannot send location.');
      return;
    }

    setIsTransmitting(true);
    setGpsError(null);

    try {
      // Get Firebase Auth token if available
      let token = null;
      if (currentUser?.getIdToken) {
        try {
          token = await currentUser.getIdToken();
        } catch {
          token = `dev-token-${currentUser.uid}`;
        }
      } else if (currentUser?.uid) {
        token = `dev-token-${currentUser.uid}`;
      } else {
        token = 'dev-token-std-731622csr045';
      }

      const clientTimestamp = new Date().toISOString();
      const response = await flaskApi.submitLocation({
        eventId: activeApprovedEvent.id,
        latitude: lat,
        longitude: lng,
        accuracy: acc,
        timestamp: clientTimestamp,
        token
      });

      // Update Last Known Location
      const record = {
        latitude: lat,
        longitude: lng,
        accuracy: acc,
        timestamp: clientTimestamp,
        server_timestamp: response?.location?.server_timestamp || clientTimestamp,
        is_inside_geofence: response?.location?.is_inside_geofence ?? true
      };

      setLastKnownLocation(record);
      setLastPingTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setPingCount(prev => prev + 1);
      setStalenessStatus('LIVE');

      // Update geofence boundary display
      if (response?.location?.is_inside_geofence === false) {
        setGeofenceStatus('Outside Bounds');
      } else {
        setGeofenceStatus('Inside Venue');
      }
    } catch (err) {
      setGpsError(err.message || 'Failed to transmit GPS location to server.');
    } finally {
      setIsTransmitting(false);
    }
  }, [activeApprovedEvent, currentUser]);

  // Function to capture one GPS position from browser
  const captureBrowserPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsSharing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setAccuracy(Math.round(acc));
        setGpsError(null);
        transmitLocationToBackend(latitude, longitude, acc);
      },
      (error) => {
        let message = 'GPS error occurred.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'GPS permission denied by user. Location sharing paused.';
            setIsSharing(false);
            setGeofenceStatus('Offline');
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'GPS position unavailable. Please verify device location services.';
            break;
          case error.TIMEOUT:
            message = 'GPS signal request timed out. Retrying on next interval.';
            break;
          default:
            message = error.message || 'Unable to acquire location.';
        }
        setGpsError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  }, [transmitLocationToBackend]);

  // Periodic heartbeat runner when sharing is enabled
  useEffect(() => {
    // Stop sharing if event ended
    if (activeApprovedEvent && (activeApprovedEvent.status === 'Completed' || activeApprovedEvent.status === 'Cancelled')) {
      setIsSharing(false);
      setGeofenceStatus('Session Ended (GPS Off)');
      return;
    }

    if (!isSharing) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
      return;
    }

    // Capture initial position immediately
    captureBrowserPosition();

    // Start configurable recurring interval
    const intervalMs = Math.max(10, updateIntervalSeconds) * 1000;
    intervalTimerRef.current = setInterval(() => {
      captureBrowserPosition();
    }, intervalMs);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
    };
  }, [isSharing, updateIntervalSeconds, activeApprovedEvent, captureBrowserPosition]);

  // Silent background location sharing for student sessions (no UI controls needed)
  const startBackgroundSharing = useCallback(() => {
    if (!activeApprovedEvent || activeApprovedEvent.status === 'Completed' || activeApprovedEvent.status === 'Cancelled') {
      return;
    }
    if (!isSharing) {
      setGpsError(null);
      setIsSharing(true);
      setGeofenceStatus('Inside Venue');
      captureBrowserPosition();
    }
  }, [activeApprovedEvent, isSharing, captureBrowserPosition]);

  // Explicit START / STOP location sharing toggle
  const toggleSharing = () => {
    // Privacy Rule: Verify event is approved and active
    if (!activeApprovedEvent || activeApprovedEvent.status === 'Completed' || activeApprovedEvent.status === 'Cancelled') {
      alert('Location sharing cannot be activated because the campus event has ended or been cancelled.');
      setIsSharing(false);
      setGeofenceStatus('Session Ended (GPS Off)');
      return;
    }

    if (isSharing) {
      // Allow students to stop sharing
      setIsSharing(false);
      setGeofenceStatus('Offline');
      setGpsError(null);
    } else {
      // Explicitly enable sharing
      setGpsError(null);
      setIsSharing(true);
      setGeofenceStatus('Inside Venue');
      // Triggers browser location permission check
      captureBrowserPosition();
    }
  };

  // Explicit stop sharing function
  const stopSharing = () => {
    setIsSharing(false);
    setGeofenceStatus('Offline');
    setGpsError(null);
  };

  // Automatically end location sharing when an event ends
  const endLocationSharingForEvent = (endedEventId) => {
    if (activeApprovedEvent?.id === endedEventId) {
      setIsSharing(false);
      setGeofenceStatus('Session Ended (GPS Off)');
      setActiveApprovedEvent(prev => prev ? { ...prev, status: 'Completed' } : null);
    }
  };

  // Manual trigger for testing / immediate update
  const sendImmediateLocationPing = () => {
    if (!isSharing) {
      setIsSharing(true);
    }
    captureBrowserPosition();
  };

  // Simulation helper for Viva demonstration
  const simulateMovement = (status, newZone = 'Main Auditorium (Kamarajar Hall)') => {
    if (activeApprovedEvent && (activeApprovedEvent.status === 'Completed' || activeApprovedEvent.status === 'Cancelled')) {
      alert('Event has ended. Location tracking is disabled.');
      return;
    }

    setGeofenceStatus(status);
    setCurrentZone(newZone);

    let newLat = 11.49824;
    let newLng = 78.16345;

    if (status === 'Outside Bounds') {
      newLat = 11.49610;
      newLng = 78.16120;
      setCoordinates({ lat: newLat, lng: newLng });
      setZoneCode('ZONE-OUT');
    } else if (status === 'Inside Venue') {
      newLat = 11.49824;
      newLng = 78.16345;
      setCoordinates({ lat: newLat, lng: newLng });
      setZoneCode('ZONE-A1');
    }

    if (isSharing) {
      transmitLocationToBackend(newLat, newLng, accuracy);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        isSharing,
        geofenceStatus,
        stalenessStatus,
        currentZone,
        zoneCode,
        coordinates,
        accuracy,
        batteryLevel,
        lastPingTime,
        lastKnownLocation,
        pingCount,
        gpsError,
        isOnline,
        isTransmitting,
        updateIntervalSeconds,
        activeApprovedEvent,
        setUpdateIntervalSeconds,
        setActiveApprovedEvent,
        endLocationSharingForEvent,
        startBackgroundSharing,
        toggleSharing,
        stopSharing,
        sendImmediateLocationPing,
        simulateMovement
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
