import React from 'react';
import {
  Navigation,
  Power,
  Compass,
  Radio,
  RefreshCw,
  Clock,
  WifiOff,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const LocationSharingWidget = () => {
  const {
    isSharing,
    geofenceStatus,
    stalenessStatus,
    currentZone,
    zoneCode,
    coordinates,
    accuracy,
    lastPingTime,
    pingCount,
    gpsError,
    isOnline,
    isTransmitting,
    updateIntervalSeconds,
    activeApprovedEvent,
    setUpdateIntervalSeconds,
    toggleSharing,
    sendImmediateLocationPing,
    simulateMovement
  } = useLocation();

  const getStalenessBadge = () => {
    switch (stalenessStatus) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE
          </span>
        );
      case 'OUTDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            OUTDATED
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card space-y-4">
      {/* Network or GPS Error Notification Banner */}
      {!isOnline && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-sm">
          <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Offline Mode:</strong> Internet disconnected. Location records will synchronize when back online.
          </span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Top Header & Sharing Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isSharing ? 'bg-cyan-50 text-cyan-600 ring-4 ring-cyan-50/50' : 'bg-slate-100 text-slate-400'}`}>
            <Navigation className={`w-5 h-5 stroke-[2.2] ${isSharing ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-navy-900">Live GPS & Geofence Status</h3>
              {getStalenessBadge()}
            </div>
            <p className="text-xs text-slate-500">
              Active: <strong className="text-navy-900 font-semibold">{activeApprovedEvent?.title || 'Campus Standby (MEC Rasipuram)'}</strong>
            </p>
          </div>
        </div>

        {/* Master ON/OFF Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleSharing}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              isSharing
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isSharing ? 'GPS Active • Stop' : 'GPS Stopped • Start'}</span>
          </button>

          <button
            onClick={sendImmediateLocationPing}
            disabled={isTransmitting}
            title="Sync location now"
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-600 hover:text-cyan-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTransmitting ? 'animate-spin text-cyan-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time Telemetry & Last Known Location Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Venue Zone */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geofenced Zone</p>
          <p className="text-xs font-bold text-navy-900 truncate mt-0.5">{currentZone || 'MEC Campus'}</p>
          <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            {zoneCode || 'MEC-CAMPUS'} {activeApprovedEvent ? `(${activeApprovedEvent.radius}m radius)` : '(Campus Standby)'}
          </span>
        </div>

        {/* GNSS Coordinates (Last Known Location) */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {stalenessStatus === 'OUTDATED' ? 'Last Known GNSS' : 'Current GNSS'}
          </p>
          <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
            {coordinates.lat.toFixed(5)}° N
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {coordinates.lng.toFixed(5)}° E
          </p>
        </div>

        {/* Accuracy */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precision</p>
          <p className="text-xs font-bold text-navy-900 mt-0.5 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> ±{accuracy}m
          </p>
          <p className="text-[10px] text-slate-400 mt-1">GNSS Locked</p>
        </div>

        {/* Heartbeat Status */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Sync</p>
          <p className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1 truncate">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" /> {lastPingTime || 'Initial'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {pingCount > 0 ? `Ping #${pingCount} synced` : 'Ready to transmit'}
          </p>
        </div>
      </div>

      {/* Configurable Location Update Interval */}
      <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-600 flex-shrink-0" />
          <div>
            <span className="font-bold text-navy-900 block">GPS Update Interval</span>
            <span className="text-slate-500 text-[11px]">
              Sync frequency during active event participation
            </span>
          </div>
        </div>

        <select
          value={updateIntervalSeconds}
          onChange={(e) => setUpdateIntervalSeconds(Number(e.target.value))}
          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value={30}>Every 30 Seconds (Fast Demo)</option>
          <option value={60}>Every 1 Minute</option>
          <option value={120}>Every 2 Minutes (Standard)</option>
          <option value={300}>Every 5 Minutes (Battery Saver)</option>
        </select>
      </div>

      {/* Demo Controls: Simulate Movement */}
      <div className="pt-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-cyan-50/60 p-3 rounded-2xl border border-cyan-100">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-cyan-950">Demo Tool: Test Geofence Response</p>
              <p className="text-[11px] text-cyan-700">Simulate moving inside or outside the seminar hall boundary.</p>
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
              Inside Hall
            </button>
            <button
              onClick={() => simulateMovement('Outside Bounds', 'Campus Cafeteria (Out of Bounds)')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                geofenceStatus === 'Outside Bounds'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              Outside Bounds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSharingWidget;
