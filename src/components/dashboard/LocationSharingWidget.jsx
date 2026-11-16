import React from 'react';
import {
  Navigation,
  ShieldCheck,
  Power,
  Compass,
  BatteryCharging,
  Radio,
  MapPin,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import Badge from '../common/Badge';

export const LocationSharingWidget = () => {
  const {
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
  } = useLocation();

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isSharing ? 'bg-cyan-50 text-cyan-600 ring-4 ring-cyan-50/50' : 'bg-slate-100 text-slate-400'}`}>
            <Navigation className={`w-6 h-6 stroke-[2.2] ${isSharing ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-navy-900">Voluntary Location Sharing</h3>
              <Badge variant={geofenceStatus} size="sm">
                {isSharing ? geofenceStatus : 'GPS Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Session-bound GPS reporting (Stops automatically when event finishes)
            </p>
          </div>
        </div>

        {/* Master ON/OFF Toggle */}
        <button
          onClick={toggleSharing}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
            isSharing
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isSharing ? 'Active • Click to Pause' : 'Paused • Click to Activate'}</span>
        </button>
      </div>

      {/* Real-time telemetry indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Venue Zone</p>
          <p className="text-xs font-bold text-navy-900 truncate mt-0.5">{currentZone}</p>
          <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            {zoneCode}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GNSS Coordinates</p>
          <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
            {coordinates.lat.toFixed(5)}° N
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {coordinates.lng.toFixed(5)}° E
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy & Precision</p>
          <p className="text-xs font-bold text-navy-900 mt-0.5 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> ±{accuracy}m (GNSS/WiFi)
          </p>
          <p className="text-[10px] text-slate-400 mt-1">High-Precision Lock</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heartbeat Synced</p>
          <p className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> {lastPingTime}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Ping #{pingCount} to /api/location</p>
        </div>
      </div>

      {/* College Viva Demonstration Controls */}
      <div className="pt-4 border-t border-dashed border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-cyan-50/60 p-3.5 rounded-2xl border border-cyan-100">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-600" />
            <div>
              <p className="text-xs font-bold text-cyan-950">Viva Demonstration: Simulate Movement</p>
              <p className="text-[11px] text-cyan-700">Test how the geofence responds when the student moves.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => simulateMovement('Inside Venue', 'Main Auditorium (Kamarajar Hall)')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                geofenceStatus === 'Inside Venue'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-white text-cyan-900 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              Inside Auditorium
            </button>
            <button
              onClick={() => simulateMovement('Outside Bounds', 'Campus Cafeteria (Out of Bounds)')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                geofenceStatus === 'Outside Bounds'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              Simulate: Walked Out to Canteen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSharingWidget;
