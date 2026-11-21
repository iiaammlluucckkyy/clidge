import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  Crosshair,
  ShieldCheck,
  ShieldAlert,
  Clock,
  RefreshCw,
  Radio,
  Sparkles
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Badge from '../common/Badge';

// Great-circle Haversine distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Map Recenter Helper
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 17, { duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
};

// Venue Center Marker Icon
const createVenueIcon = (name) => {
  return L.divIcon({
    className: 'custom-venue-icon',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:#0b1d33; color:#38bdf8; border:2px solid #38bdf8; padding:3px 8px; border-radius:10px; font-size:10px; font-weight:800; white-space:nowrap; box-shadow:0 4px 10px rgba(0,0,0,0.4); display:flex; align-items:center; gap:4px;">
          <span>🏛️</span>
          <span>${name || 'Event Venue'}</span>
        </div>
        <div style="width:14px; height:14px; background:#06b6d4; border:2.5px solid white; border-radius:50%; box-shadow:0 0 10px #06b6d4;"></div>
        <div style="width:2px; height:5px; background:#06b6d4;"></div>
      </div>
    `,
    iconSize: [0, 0]
  });
};

// Student's Own Live Location Marker Icon
const createMyStudentIcon = (name, isInside, isLive) => {
  const color = isLive ? (isInside ? '#10b981' : '#f43f5e') : '#f59e0b';
  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return L.divIcon({
    className: 'custom-my-location-icon',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:38px; height:38px; transform: translate(-50%, -50%);">
        <div style="position:absolute; width:38px; height:38px; border-radius:50%; background:${color}; opacity:0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position:relative; width:28px; height:28px; border-radius:50%; background:#0b1d33; border:3px solid ${color}; color:white; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
          ${initial}
        </div>
        <div style="position:absolute; bottom:-8px; padding:1px 6px; border-radius:6px; background:${color}; color:white; font-size:8px; font-weight:800; white-space:nowrap; text-transform:uppercase;">
          YOU (${isInside ? 'INSIDE' : 'OUTSIDE'})
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

export const StudentLiveLocationMap = () => {
  const { currentUser } = useAuth();
  const {
    coordinates,
    accuracy,
    geofenceStatus,
    stalenessStatus,
    isSharing,
    activeApprovedEvent,
    sendImmediateLocationPing,
    simulateMovement,
    isTransmitting
  } = useLocation();

  const venueLat = activeApprovedEvent?.latitude || 11.4982;
  const venueLng = activeApprovedEvent?.longitude || 78.1634;
  const venueRadius = activeApprovedEvent?.radius || 65;
  const venueName = activeApprovedEvent?.venue || 'Main Auditorium';

  const studentLat = coordinates?.lat || venueLat;
  const studentLng = coordinates?.lng || venueLng;

  const distanceToVenue = calculateDistance(studentLat, studentLng, venueLat, venueLng);
  const isInside = distanceToVenue !== null ? distanceToVenue <= venueRadius : true;
  const isLive = stalenessStatus === 'LIVE' || isSharing;

  const mapCenter = [studentLat, studentLng];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-navy-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-600" />
              My Campus Live Location & Geofence
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isInside
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isInside ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
              ></span>
              {isInside ? 'Inside Geofence Boundary' : 'Outside Geofence Perimeter'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Event: <strong className="text-navy-900">{activeApprovedEvent?.title || 'Campus Session'}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={simulateMovement}
            icon={Sparkles}
            title="Simulate walking inside/outside geofence"
          >
            Simulate GPS
          </Button>
          <Button
            variant="cyan"
            size="sm"
            onClick={sendImmediateLocationPing}
            disabled={isTransmitting}
            icon={RefreshCw}
            className={isTransmitting ? 'animate-spin' : ''}
          >
            {isTransmitting ? 'Syncing...' : 'Update GPS'}
          </Button>
        </div>
      </div>

      {/* Telemetry Indicator Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-navy-950 text-white text-xs border-b border-navy-800">
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">My Latitude, Longitude</span>
          <span className="font-mono font-bold text-cyan-300">
            {studentLat.toFixed(5)}, {studentLng.toFixed(5)}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Distance to Venue</span>
          <span className="font-bold text-emerald-400">
            {distanceToVenue !== null ? `${distanceToVenue} m` : 'Calculating...'}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Geofence Radius</span>
          <span className="font-bold text-slate-200">{venueRadius} meters</span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">GNSS Accuracy</span>
          <span className="font-bold text-cyan-400">±{accuracy || 4.5} m (Verified)</span>
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="h-[360px] sm:h-[420px] w-full relative">
        <MapContainer
          center={mapCenter}
          zoom={18}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          <MapRecenter center={mapCenter} zoom={18} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Event Venue Center Marker */}
          <Marker position={[venueLat, venueLng]} icon={createVenueIcon(venueName)}>
            <Popup>
              <div className="text-xs space-y-1 p-1">
                <p className="font-bold text-navy-900">{venueName}</p>
                <p className="text-slate-500">Official Geofence Center</p>
                <p className="font-mono text-cyan-700">Radius: {venueRadius}m</p>
              </div>
            </Popup>
          </Marker>

          {/* Venue Geofence Perimeter Circle */}
          <Circle
            center={[venueLat, venueLng]}
            radius={venueRadius}
            pathOptions={{
              color: isInside ? '#06b6d4' : '#f43f5e',
              fillColor: isInside ? '#06b6d4' : '#f43f5e',
              fillOpacity: 0.15,
              weight: 2.5,
              dashArray: '6, 6'
            }}
          />

          {/* Student's Own Live Location Marker */}
          <Marker
            position={[studentLat, studentLng]}
            icon={createMyStudentIcon(currentUser?.name, isInside, isLive)}
          >
            <Popup>
              <div className="text-xs space-y-1 p-1">
                <p className="font-bold text-navy-900">{currentUser?.name || 'Your Location'}</p>
                <p className="text-slate-500">{currentUser?.registrationNumber || 'Student'}</p>
                <p className={`font-bold ${isInside ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Status: {isInside ? 'Inside Geofence' : 'Outside Bounds'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Distance: {distanceToVenue}m from venue center
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Map Floating Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-md text-[11px] space-y-1 z-10 max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700 font-medium">Inside Geofence: Attendance verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-700 font-medium">Outside Bounds: Move closer to venue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-cyan-500"></span>
            <span className="text-slate-700 font-medium">Dashed Circle: {venueRadius}m Geofence Perimeter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLiveLocationMap;
