import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle, CloudOff } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export const OfflineSyncBanner = () => {
  const { isOnline, pendingCount, isSyncing, syncPendingNow, notification } = useAttendance();

  // If there's an active global notification, or offline state, or pending items
  const showOfflineNotice = !isOnline;
  const showPendingNotice = isOnline && pendingCount > 0;

  if (!showOfflineNotice && !showPendingNotice && !notification) {
    return null;
  }

  return (
    <aside aria-label="System status" className="space-y-2 mb-4 animate-in fade-in-50 duration-300">
      {/* 1. Offline Mode Indicator */}
      {showOfflineNotice && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                Offline Mode Detected
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-mono font-bold">
                  IndexedDB Active
                </span>
              </p>
              <p className="text-[11px] text-amber-800">
                You are offline. Scans are saved to local storage and will sync automatically when reconnected.
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-200 text-amber-900 rounded-xl flex-shrink-0">
              {pendingCount} Pending
            </span>
          )}
        </div>
      )}

      {/* 2. Pending Sync Alert (when online) */}
      {showPendingNotice && (
        <div className="bg-cyan-50 border border-cyan-300/80 text-cyan-950 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CloudOff className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                Pending Offline Records
                <span className="text-[10px] bg-cyan-200 text-cyan-900 px-2 py-0.5 rounded-full font-bold">
                  {pendingCount} Queued
                </span>
              </p>
              <p className="text-[11px] text-cyan-800">
                {pendingCount} record(s) queued for server synchronization.
              </p>
            </div>
          </div>
          <button
            onClick={syncPendingNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-all disabled:opacity-50 flex-shrink-0 shadow-sm shadow-cyan-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronizing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {/* 3. Transient Toast / Notification */}
      {notification && (
        <div
          className={`text-xs px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-2 shadow-sm animate-in fade-in-50 ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-cyan-50 border-cyan-200 text-cyan-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {notification.type === 'info' && <RefreshCw className="w-4 h-4 text-cyan-600 flex-shrink-0" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default OfflineSyncBanner;
