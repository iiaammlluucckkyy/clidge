import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { subscribeCollegeZones } from '../services/zoneService.js';
import { calculateHaversineMeters, getCampusLandmark } from '../data/campusZones.js';
import { reverseGeocodeAddress } from '../services/geocodingService.js';
import {
  validateSessionForStudent,
  subscribeSingleSession,
  publishStudentSessionLocation,
  stopStudentSessionLocation
} from '../services/sessionService.js';

const LocationContext = createContext();

const MAX_ACCEPTED_ACCURACY_METERS = 150;
const WRITE_MIN_INTERVAL_MS = 3500;
const STALE_THRESHOLD_MS = 60 * 1000; // 60 seconds -> LIVE vs Stale tag

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Sharing & session state
  const [activeSession, setActiveSession] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  // Real device coordinates (null until real GPS acquired — never fake!)
  const [coordinates, setCoordinates] = useState(null);
  const [previewCoordinates, setPreviewCoordinates] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [currentPlace, setCurrentPlace] = useState('');
  const [matchedZoneName, setMatchedZoneName] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [waitingForBetterFix, setWaitingForBetterFix] = useState(false);
  const [lowAccuracyValue, setLowAccuracyValue] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pingCount, setPingCount] = useState(0);

  // College custom zones
  const [collegeZones, setCollegeZones] = useState([]);

  // Legacy-safe fields kept so secondary badges never break
  const [activeApprovedEvent, setActiveApprovedEvent] = useState(null);
  const [stalenessStatus, setStalenessStatus] = useState('UNAVAILABLE');

  const watchIdRef = useRef(null);
  const lastWriteAtRef = useRef(0);
  const lastWrittenCoordsRef = useRef(null);
  const collegeZonesRef = useRef([]);

  useEffect(() => {
    collegeZonesRef.current = collegeZones;
  }, [collegeZones]);

  // Subscribe to this college's zones
  useEffect(() => {
    if (!currentUser?.collegeCode) {
      setCollegeZones([]);
      return;
    }
    const unsub = subscribeCollegeZones(currentUser.collegeCode, (zones) => {
      setCollegeZones(zones);
    });
    return () => unsub && unsub();
  }, [currentUser?.collegeCode]);

  // Monitor network connectivity
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Passively center map ONLY if browser geolocation permission is already granted
  // (Never prompts without explicit user click; never shares automatically)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((perm) => {
          if (perm.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setPreviewCoordinates({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  accuracy: Math.round(pos.coords.accuracy || 0)
                });
              },
              () => {},
              { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
            );
          }
        })
        .catch(() => {});
    }
  }, []);

  // Monitor staleness for current user's own indicator
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastUpdatedAt) {
        setStalenessStatus('UNAVAILABLE');
        return;
      }
      const age = Date.now() - new Date(lastUpdatedAt).getTime();
      setStalenessStatus(isSharing && age <= STALE_THRESHOLD_MS ? 'LIVE' : 'OUTDATED');
    }, 5000);
    return () => clearInterval(timer);
  }, [lastUpdatedAt, isSharing]);

  // Clean clearWatch helper
  const clearGeoWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Stop sharing completely
  const stopSharing = useCallback(async (reasonMessage = null) => {
    clearGeoWatch();
    setIsSharing(false);
    setWaitingForBetterFix(false);
    setLowAccuracyValue(null);
    if (reasonMessage) {
      setSessionError(reasonMessage);
    }
    if (activeSession?.sessionCode && currentUser?.uid) {
      await stopStudentSessionLocation(activeSession.sessionCode, currentUser);
    }
  }, [clearGeoWatch, activeSession?.sessionCode, currentUser]);

  // Listen to active session status: if faculty clicks "End session", stop student sharing immediately
  useEffect(() => {
    if (!activeSession?.sessionCode) return;
    const unsub = subscribeSingleSession(activeSession.sessionCode, (updatedSession) => {
      if (!updatedSession || !updatedSession.active) {
        stopSharing('This location session has been ended by your faculty.');
        setActiveSession(updatedSession);
      } else {
        setActiveSession(updatedSession);
      }
    });
    return () => unsub && unsub();
  }, [activeSession?.sessionCode, stopSharing]);

  // Clean up watch on unmount or logout
  useEffect(() => {
    if (!currentUser) {
      clearGeoWatch();
      setIsSharing(false);
      setActiveSession(null);
      setCoordinates(null);
      setAccuracy(null);
      setCurrentPlace('');
    }
    return () => clearGeoWatch();
  }, [currentUser, clearGeoWatch]);

  // Validate a session code without auto-starting sharing
  const joinSessionCode = useCallback(async (rawCode) => {
    setSessionError(null);
    const session = await validateSessionForStudent(rawCode, currentUser);
    setActiveSession(session);
    return session;
  }, [currentUser]);

  // User-triggered center map on GPS (does NOT start sharing to faculty)
  const centerOnMyGps = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation is not supported by this browser. Use Chrome or Safari on HTTPS.';
        setGpsError(msg);
        reject(new Error(msg));
        return;
      }
      setGpsError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 0)
          };
          setPreviewCoordinates(coords);
          resolve(coords);
        },
        (err) => {
          let msg = 'Unable to get your GPS position.';
          if (err.code === err.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please enable Location access in your browser settings and try again.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'GPS position is unavailable. Turn on device Location / GPS and move near a window or outdoors.';
          } else if (err.code === err.TIMEOUT) {
            msg = 'GPS request timed out after 20 seconds. Move closer to open sky and retry.';
          }
          setGpsError(msg);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );
    });
  }, []);

  /**
   * Explicit Start Sharing: runs ONLY when student taps "Start sharing".
   */
  const startSharing = useCallback(async (sessionCodeOverride = null) => {
    setGpsError(null);
    setSessionError(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Your browser does not support GPS location tracking. Please open on a smartphone browser over HTTPS.');
      return;
    }

    let sessionToUse = activeSession;
    const code = sessionCodeOverride?.trim() || activeSession?.sessionCode;
    if (!code) {
      setSessionError('Please enter a Session Code or scan the faculty QR code first.');
      return;
    }

    try {
      sessionToUse = await validateSessionForStudent(code, currentUser);
      setActiveSession(sessionToUse);
    } catch (err) {
      setSessionError(err.message);
      return;
    }

    clearGeoWatch();
    setIsSharing(true);
    setWaitingForBetterFix(false);
    lastWriteAtRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy: rawAcc } = position.coords;
        const accMeters = Math.round(rawAcc || 0);

        setPreviewCoordinates({ lat: latitude, lng: longitude, accuracy: accMeters });

        // Reject / ignore fixes worse than 150 m
        if (accMeters > MAX_ACCEPTED_ACCURACY_METERS) {
          setWaitingForBetterFix(true);
          setLowAccuracyValue(accMeters);
          return;
        }

        setWaitingForBetterFix(false);
        setLowAccuracyValue(null);
        setGpsError(null);
        setCoordinates({ lat: latitude, lng: longitude });
        setAccuracy(accMeters);

        // Match against this college's defined Zones ONLY if inside zone radius
        const landmarkMatch = getCampusLandmark(latitude, longitude, collegeZonesRef.current);
        let placeLabel = '';
        let zoneName = null;
        let isInsideZone = false;

        if (landmarkMatch.isInside && landmarkMatch.landmark) {
          placeLabel = landmarkMatch.landmark;
          zoneName = landmarkMatch.landmark;
          isInsideZone = true;
        } else {
          // Otherwise use rate-limited Nominatim reverse geocoding (1 req / 5s)
          placeLabel = await reverseGeocodeAddress(latitude, longitude);
        }

        setCurrentPlace(placeLabel);
        setMatchedZoneName(zoneName);
        const nowIso = new Date().toISOString();
        setLastUpdatedAt(nowIso);
        setStalenessStatus('LIVE');

        // Push to Firestore / Demo Session store (throttled cleanly)
        const elapsed = Date.now() - lastWriteAtRef.current;
        const moved = lastWrittenCoordsRef.current
          ? calculateHaversineMeters(
              lastWrittenCoordsRef.current.lat,
              lastWrittenCoordsRef.current.lng,
              latitude,
              longitude
            )
          : 999;

        if (elapsed >= WRITE_MIN_INTERVAL_MS || moved >= 8) {
          lastWriteAtRef.current = Date.now();
          lastWrittenCoordsRef.current = { lat: latitude, lng: longitude };
          try {
            await publishStudentSessionLocation(sessionToUse.sessionCode, currentUser, {
              latitude,
              longitude,
              accuracy: accMeters,
              placeName: placeLabel,
              zoneName,
              isInsideZone
            });
            setPingCount(c => c + 1);
          } catch (err) {
            setGpsError(err.message || 'Could not upload GPS location.');
          }
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(
            'Location permission denied. Tap the lock/settings icon in your browser address bar, set Location to Allow, and tap Start sharing again.'
          );
          clearGeoWatch();
          setIsSharing(false);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsError(
            'GPS position unavailable. Make sure your device Location / GPS toggle is ON and try moving near a window or outdoors.'
          );
        } else if (error.code === error.TIMEOUT) {
          setGpsError(
            'GPS signal timed out after 20 seconds. Waiting for satellite lock — step closer to open sky.'
          );
        } else {
          setGpsError(error.message || 'GPS error occurred.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000
      }
    );
  }, [activeSession, currentUser, clearGeoWatch]);

  const endLocationSharingForEvent = useCallback(() => {
    stopSharing();
  }, [stopSharing]);

  const startBackgroundSharing = useCallback(() => {}, []);
  const toggleSharing = useCallback(() => {
    if (isSharing) stopSharing();
    else startSharing();
  }, [isSharing, startSharing, stopSharing]);

  const geofenceStatus = !isSharing
    ? 'Standby'
    : waitingForBetterFix
    ? 'Waiting for GPS fix'
    : matchedZoneName
    ? 'Inside Venue'
    : 'GPS Live';

  return (
    <LocationContext.Provider
      value={{
        activeSession,
        setActiveSession,
        sessionError,
        setSessionError,
        joinSessionCode,
        isSharing,
        coordinates,
        previewCoordinates,
        accuracy,
        currentPlace,
        matchedZoneName,
        lastUpdatedAt,
        waitingForBetterFix,
        lowAccuracyValue,
        gpsError,
        isOnline,
        pingCount,
        collegeZones,
        startSharing,
        stopSharing,
        centerOnMyGps,
        // Legacy compatibility props
        geofenceStatus,
        stalenessStatus,
        currentZone: matchedZoneName || currentPlace || 'Not sharing',
        zoneCode: activeSession?.sessionCode || '',
        lastPingTime: lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null,
        activeApprovedEvent,
        setActiveApprovedEvent,
        endLocationSharingForEvent,
        startBackgroundSharing,
        toggleSharing
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
