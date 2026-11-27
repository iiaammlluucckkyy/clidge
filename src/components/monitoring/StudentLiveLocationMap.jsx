import React, { useEffect, useState } from 'react';
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
  Sparkles,
  Building,
  UtensilsCrossed,
  Home
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { CAMPUS_ZONES, getCampusLandmark, calculateHaversineMeters } from '../../data/campusZones.js';
import Button from '../common/Button';
import Badge from '../common/Badge';

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

// Campus Landmark Icon (Hostel, Canteen, Labs, etc.)
const createLandmarkIcon = (zone) => {
  let emoji = '🏛️';
  if (zone.type.includes('Canteen') || zone.type.includes('Cafeteria')) emoji = '🍴';
  else if (zone.type.includes('Hostel')) emoji = '🏢';
  else if (zone.type.includes('Lab')) emoji = '🔬';
  else if (zone.type.includes('Seminar')) emoji = '💻';
  else if (zone.type.includes('Library')) emoji = '📚';
  else if (zone.type.includes('Sports')) emoji = '⚽';

  return L.divIcon({
    className: 'custom-campus-landmark',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); pointer-events:auto;">
        <div style="background:#0b1d33; color:${zone.color}; border:1.5px solid ${zone.color}; padding:2px 6px; border-radius:8px; font-size:9px; font-weight:700; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; gap:3px;">
          <span>${emoji}</span>
          <span>${zone.name.split(' (')[0]}</span>
        </div>
        <div style="width:8px; height:8px; background:${zone.color}; border:1.5px solid white; border-radius:50%;"></div>
      </div>
    `,
    iconSize: [0, 0]
  });
};

// Student's Own Live Location Marker Icon
const createMyStudentIcon = (name, isInside, isLive, hasActiveEvent) => {
  const color = !hasActiveEvent
    ? '#06b6d4'
    : (isLive ? (isInside ? '#10b981' : '#f43f5e') : '#f59e0b');
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const label = hasActiveEvent
    ? (isInside ? 'YOU (INSIDE)' : 'YOU (OUTSIDE)')
    : 'YOU (LIVE GPS)';

  return L.divIcon({
    className: 'custom-my-location-icon',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:40px; height:40px; transform: translate(-50%, -50%);">
        <div style="position:absolute; width:40px; height:40px; border-radius:50%; background:${color}; opacity:0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position:relative; width:28px; height:28px; border-radius:50%; background:#0b1d33; border:3px solid ${color}; color:white; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
          ${initial}
        </div>
        <div style="position:absolute; bottom:-9px; padding:1px 6px; border-radius:6px; background:${color}; color:white; font-size:8px; font-weight:800; white-space:nowrap; text-transform:uppercase; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
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
    isTransmitting,
    currentZone
  } = useLocation();

  const venueLat = activeApprovedEvent?.latitude || 11.4448;
  const venueLng = activeApprovedEvent?.longitude || 78.2263;
  const venueRadius = activeApprovedEvent?.radius || 65;
  const venueName = activeApprovedEvent?.venue || 'Main Auditorium';

  const studentLat = coordinates?.lat || 11.4450;
  const studentLng = coordinates?.lng || 78.2264;

  const distanceToVenue = activeApprovedEvent
    ? calculateHaversineMeters(studentLat, studentLng, venueLat, venueLng)
    : null;
  const isInside = distanceToVenue !== null ? distanceToVenue <= venueRadius : true;
  const isLive = stalenessStatus === 'LIVE' || isSharing;
  const hasActiveEvent = Boolean(activeApprovedEvent);

  const detectedLandmark = getCampusLandmark(studentLat, studentLng);
  const mapCenter = [studentLat, studentLng];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-navy-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-600" />
              My Campus Live Location (MEC Rasipuram)
            </h3>
            {hasActiveEvent ? (
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
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                Standby — Live GNSS Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasActiveEvent ? (
              <>Active Session: <strong className="text-navy-900">{activeApprovedEvent.title}</strong></>
            ) : (
              <>Campus Area: <strong className="text-navy-900">{detectedLandmark.landmark}</strong> (No active event session joined)</>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="cyan"
            size="sm"
            onClick={sendImmediateLocationPing}
            disabled={isTransmitting}
            icon={RefreshCw}
            className={isTransmitting ? 'animate-spin' : ''}
            title="Read live satellite hardware GPS from device"
          >
            {isTransmitting ? 'Acquiring...' : 'Update GPS'}
          </Button>
        </div>
      </div>

      {/* Campus Landmark Quick Location Simulator Bar */}
      <div className="p-3 bg-slate-100/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-navy-900 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          Test Location at MEC Landmarks:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => simulateMovement('Auditorium')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-navy-900 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 shadow-2xs transition-colors"
          >
            🏛️ Auditorium
          </button>
          <button
            onClick={() => simulateMovement('Canteen')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-orange-900 hover:bg-orange-50 hover:text-orange-950 border border-slate-200 shadow-2xs transition-colors"
          >
            🍴 Canteen
          </button>
          <button
            onClick={() => simulateMovement('Hostel')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-pink-900 hover:bg-pink-50 hover:text-pink-950 border border-slate-200 shadow-2xs transition-colors"
          >
            🏢 Hostels
          </button>
          <button
            onClick={() => simulateMovement('Outside Bounds')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-rose-900 hover:bg-rose-50 border border-slate-200 shadow-2xs transition-colors"
          >
            🚶 Outside Campus
          </button>
        </div>
      </div>

      {/* Telemetry Indicator Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-navy-950 text-white text-xs border-b border-navy-800">
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Coordinates</span>
          <span className="font-mono font-bold text-cyan-300">
            {studentLat.toFixed(5)}, {studentLng.toFixed(5)}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Campus Landmark</span>
          <span className="font-bold text-emerald-400 truncate block">
            {detectedLandmark.landmark}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">
            {hasActiveEvent ? 'Distance to Venue' : 'Geofence Mode'}
          </span>
          <span className="font-bold text-slate-200">
            {hasActiveEvent ? `${distanceToVenue} m (${venueRadius}m boundary)` : 'Campus Standby'}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">GNSS Precision</span>
          <span className="font-bold text-cyan-400">±{accuracy || 3.5} m (Verified)</span>
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

          {/* Render All Muthayammal Campus Landmarks (Hostel, Canteen, Auditorium, Labs, Library, Sports) */}
          {CAMPUS_ZONES.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle
                center={[zone.center.lat, zone.center.lng]}
                radius={zone.radiusMeters}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
              <Marker
                position={[zone.center.lat, zone.center.lng]}
                icon={createLandmarkIcon(zone)}
              >
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <p className="font-bold text-navy-900">{zone.name}</p>
                    <p className="text-slate-500">{zone.building}</p>
                    <p className="font-mono text-cyan-700">{zone.code} • Radius: {zone.radiusMeters}m</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* If Event Joined: Render Event Venue Center Marker & Geofence Boundary */}
          {hasActiveEvent && (
            <>
              <Marker position={[venueLat, venueLng]} icon={createVenueIcon(venueName)}>
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <p className="font-bold text-navy-900">{venueName}</p>
                    <p className="text-slate-500">Official Geofence Center</p>
                    <p className="font-mono text-cyan-700">Radius: {venueRadius}m</p>
                  </div>
                </Popup>
              </Marker>

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
            </>
          )}

          {/* Student's Own Live Location Marker */}
          <Marker
            position={[studentLat, studentLng]}
            icon={createMyStudentIcon(currentUser?.name, isInside, isLive, hasActiveEvent)}
          >
            <Popup>
              <div className="text-xs space-y-1 p-1">
                <p className="font-bold text-navy-900">{currentUser?.name || 'Your Location'}</p>
                <p className="text-slate-500">{currentUser?.registrationNumber || 'Student'}</p>
                <div className="py-1 px-1.5 rounded bg-cyan-50 border border-cyan-100 text-cyan-900 font-bold text-[11px]">
                  📍 {detectedLandmark.landmark}
                </div>
                {hasActiveEvent ? (
                  <>
                    <p className={`font-bold ${isInside ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Status: {isInside ? 'Inside Geofence' : 'Outside Bounds'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Distance: {distanceToVenue}m from venue center
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-emerald-600 font-bold">
                    Real Device GPS Active on Campus
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Map Floating Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-md text-[11px] space-y-1 z-10 max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span className="text-slate-700 font-medium">Cyan Pulse: Your Live Location</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-700 font-medium">Orange Circle: Campus Canteen & Food Court</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span className="text-slate-700 font-medium">Pink Circle: Student Hostels</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLiveLocationMap;
