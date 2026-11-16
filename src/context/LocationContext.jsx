import React, { createContext, useContext, useState, useEffect } from 'react';
import { flaskApi } from '../services/flaskApi';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [isSharing, setIsSharing] = useState(true);
  const [geofenceStatus, setGeofenceStatus] = useState('Inside Venue'); // 'Inside Venue' | 'Outside Bounds' | 'Offline'
  const [currentZone, setCurrentZone] = useState('Main Auditorium (Kamarajar Hall)');
  const [zoneCode, setZoneCode] = useState('ZONE-A1');
  const [coordinates, setCoordinates] = useState({ lat: 11.49824, lng: 78.16345 });
  const [accuracy, setAccuracy] = useState(4.2); // ± meters
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [lastPingTime, setLastPingTime] = useState('Just now (12s ago)');
  const [pingCount, setPingCount] = useState(1);

  // Heartbeat simulation
  useEffect(() => {
    if (!isSharing) {
      setGeofenceStatus('Offline');
      return;
    }

    const interval = setInterval(() => {
      setPingCount(prev => prev + 1);
      setLastPingTime('Just now');
      
      // Optionally notify backend stub
      flaskApi.sendLocationHeartbeat({
        studentId: 'std-731622csr045',
        eventId: 'evt-2026-001',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        accuracy,
        batteryLevel
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [isSharing, coordinates, accuracy, batteryLevel]);

  const toggleSharing = () => {
    setIsSharing(prev => {
      const next = !prev;
      if (!next) {
        setGeofenceStatus('Offline');
      } else {
        setGeofenceStatus('Inside Venue');
      }
      return next;
    });
  };

  // Demonstration simulation helper: lets the presenter toggle student movement
  const simulateMovement = (status, newZone = 'Main Auditorium (Kamarajar Hall)') => {
    setGeofenceStatus(status);
    setCurrentZone(newZone);
    if (status === 'Outside Bounds') {
      setCoordinates({ lat: 11.49610, lng: 78.16120 });
      setZoneCode('ZONE-OUT');
    } else if (status === 'Inside Venue') {
      setCoordinates({ lat: 11.49824, lng: 78.16345 });
      setZoneCode('ZONE-A1');
      setIsSharing(true);
    } else {
      setIsSharing(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        isSharing,
        geofenceStatus,
        currentZone,
        zoneCode,
        coordinates,
        accuracy,
        batteryLevel,
        lastPingTime,
        pingCount,
        toggleSharing,
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
