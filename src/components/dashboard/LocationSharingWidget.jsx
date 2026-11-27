import React from 'react';
import {
  Navigation,
  Power,
  Radio,
  Clock,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const LocationSharingWidget = () => {
  const {
    isSharing,
    stalenessStatus,
    currentPlace,
    matchedZoneName,
    activeSession,
    coordinates,
    accuracy,
    lastPingTime,
    pingCount,
    gpsError,
    isOnline,
    startSharing,
    stopSharing
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
            STALE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-card space-y-4">
      {!isOnline && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Internet disconnected. GPS location will upload once reconnected.</span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isSharing ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-navy-900 dark:text-white">GPS Sharing Status</h3>
              {getStalenessBadge()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeSession ? `Session: ${activeSession.sessionCode}` : 'No session joined yet'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (isSharing ? stopSharing() : startSharing())}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            isSharing
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isSharing ? 'Stop sharing' : 'Start sharing'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Current Place</p>
          <p className="font-bold text-navy-900 dark:text-white truncate mt-0.5">
            {matchedZoneName || currentPlace || 'Not active'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Coordinates</p>
          <p className="font-mono font-bold text-slate-800 dark:text-cyan-300 mt-0.5">
            {coordinates ? `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}` : '—'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
          <p className="font-bold text-navy-900 dark:text-white mt-0.5 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-cyan-500" />
            {accuracy !== null ? `±${accuracy}m` : 'Pending'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Last Sync</p>
          <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1 truncate">
            <Clock className="w-3.5 h-3.5 shrink-0" /> {lastPingTime || 'Idle'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{pingCount} updates</p>
        </div>
      </div>
    </div>
  );
};

export default LocationSharingWidget;
