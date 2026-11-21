import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flaskApi } from '../services/flaskApi';
import { offlineStorage } from '../services/offlineStorage';
import { useAuth } from './AuthContext';

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const { currentUser, currentRole } = useAuth();

  // Network connectivity state
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  // Offline queue state
  const [pendingItems, setPendingItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Notification state
  const [notification, setNotification] = useState(null); // { type: 'success'|'error'|'info'|'warning', message: '' }

  // Active QR codes cache { [eventId]: { qr_token, issued_at, expires_at } }
  const [activeQrTokens, setActiveQrTokens] = useState({});

  // Active attendance report cache { [eventId]: reportData }
  const [cachedReports, setCachedReports] = useState({});

  // Student personal history
  const [studentHistory, setStudentHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Refresh pending items from IndexedDB
  const refreshPendingQueue = useCallback(async () => {
    try {
      const items = await offlineStorage.getPendingAttendance();
      setPendingItems(items);
    } catch (err) {
      console.warn('Error reading offline queue:', err);
    }
  }, []);

  // Monitor online / offline network events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotification({
        type: 'info',
        message: 'Internet connection restored. Synchronizing pending attendance records...'
      });
      // Trigger automatic sync on reconnection
      syncPendingNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setNotification({
        type: 'warning',
        message: 'You are currently offline. Attendance scans will be stored locally in IndexedDB and verified on reconnect.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial queue check
    refreshPendingQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingQueue]);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  /**
   * TEACHER: Generate or refresh event QR code token
   */
  const generateEventQr = async (eventId, validityMinutes = 60) => {
    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + (currentUser?.uid || 'fac-001');
      const res = await flaskApi.generateEventQr(eventId, token, validityMinutes);
      if (res && res.qr_token) {
        setActiveQrTokens(prev => ({
          ...prev,
          [eventId]: {
            qr_token: res.qr_token,
            issued_at: res.issued_at,
            expires_at: res.expires_at,
            validity_minutes: res.validity_minutes
          }
        }));
        return res;
      }
      throw new Error(res?.error || 'Failed to generate QR token');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
      throw err;
    }
  };

  /**
   * Retrieve active QR token for an event
   */
  const getEventQr = async (eventId) => {
    if (activeQrTokens[eventId]) return activeQrTokens[eventId];
    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + (currentUser?.uid || 'fac-001');
      const res = await flaskApi.getEventQr(eventId, token);
      if (res && res.qr_token) {
        setActiveQrTokens(prev => ({ ...prev, [eventId]: res }));
        return res;
      }
      return null;
    } catch {
      return null;
    }
  };

  /**
   * STUDENT: Check-in to event via QR scan
   */
  const checkIn = async ({ eventId, eventTitle, qrToken }) => {
    const studentId = currentUser?.uid;
    const studentName = currentUser?.name || currentUser?.displayName || 'Student';

    // If completely offline, queue directly into IndexedDB
    if (!navigator.onLine) {
      const pendingRecord = await offlineStorage.queuePendingAttendance({
        eventId,
        eventTitle,
        action: 'check-in',
        qrToken,
        studentId,
        studentName
      });
      await refreshPendingQueue();
      setNotification({
        type: 'warning',
        message: 'Offline Mode: Check-in queued in local storage. Will verify with server once connected.'
      });
      return {
        success: true,
        offlineQueued: true,
        record: pendingRecord
      };
    }

    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + studentId;
      const res = await flaskApi.studentCheckIn({
        eventId,
        qrToken,
        token
      });

      if (res && res.success) {
        setNotification({
          type: 'success',
          message: 'Attendance check-in verified by server successfully!'
        });
        // Cache locally for offline viewing
        if (res.attendance_record) {
          await offlineStorage.saveCachedAttendance([res.attendance_record]);
        }
        return res;
      } else if (res && res.offline) {
        // Server unreachable fallback
        const pendingRecord = await offlineStorage.queuePendingAttendance({
          eventId,
          eventTitle,
          action: 'check-in',
          qrToken,
          studentId,
          studentName
        });
        await refreshPendingQueue();
        setNotification({
          type: 'warning',
          message: 'Server unreachable: Check-in safely saved to local queue.'
        });
        return { success: true, offlineQueued: true, record: pendingRecord };
      }
      throw new Error(res?.error || 'Check-in failed');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
      throw err;
    }
  };

  /**
   * STUDENT: Check-out from event via QR scan
   */
  const checkOut = async ({ eventId, eventTitle, qrToken }) => {
    const studentId = currentUser?.uid;
    const studentName = currentUser?.name || currentUser?.displayName || 'Student';

    if (!navigator.onLine) {
      const pendingRecord = await offlineStorage.queuePendingAttendance({
        eventId,
        eventTitle,
        action: 'check-out',
        qrToken,
        studentId,
        studentName
      });
      await refreshPendingQueue();
      setNotification({
        type: 'warning',
        message: 'Offline Mode: Check-out queued in local storage. Will verify with server once connected.'
      });
      return {
        success: true,
        offlineQueued: true,
        record: pendingRecord
      };
    }

    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + studentId;
      const res = await flaskApi.studentCheckOut({
        eventId,
        qrToken,
        token
      });

      if (res && res.success) {
        setNotification({
          type: 'success',
          message: 'Attendance check-out verified by server successfully!'
        });
        if (res.attendance_record) {
          await offlineStorage.saveCachedAttendance([res.attendance_record]);
        }
        return res;
      } else if (res && res.offline) {
        const pendingRecord = await offlineStorage.queuePendingAttendance({
          eventId,
          eventTitle,
          action: 'check-out',
          qrToken,
          studentId,
          studentName
        });
        await refreshPendingQueue();
        setNotification({
          type: 'warning',
          message: 'Server unreachable: Check-out safely saved to local queue.'
        });
        return { success: true, offlineQueued: true, record: pendingRecord };
      }
      throw new Error(res?.error || 'Check-out failed');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
      throw err;
    }
  };

  /**
   * Synchronise all pending offline records to Flask backend
   */
  const syncPendingNow = async () => {
    const items = await offlineStorage.getPendingAttendance();
    if (!items || items.length === 0) return { success: true, count: 0 };

    setIsSyncing(true);
    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + (currentUser?.uid || 'std-001');
      const payloadItems = items.map(item => ({
        sync_id: item.syncId,
        event_id: item.eventId,
        action: item.action,
        qr_token: item.qrToken,
        offline_timestamp: item.offlineTimestamp
      }));

      const res = await flaskApi.syncOfflineAttendance({ items: payloadItems, token });

      if (res && res.success) {
        // Remove successfully verified items from IndexedDB
        for (const item of items) {
          await offlineStorage.removePendingAttendance(item.syncId);
        }
        await refreshPendingQueue();
        setNotification({
          type: 'success',
          message: `Successfully synchronized and verified ${res.success_count} offline record(s)!`
        });
        setLastSyncResult(res);
        return res;
      }
    } catch (err) {
      console.warn('Sync failed:', err);
      setNotification({
        type: 'error',
        message: `Sync failed: ${err.message}. Records remain safely in local storage.`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Fetch full attendance report for an event
   */
  const fetchAttendanceReport = async (eventId) => {
    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + (currentUser?.uid || 'fac-001');
      const report = await flaskApi.getEventAttendanceReport(eventId, token);
      if (report && report.success) {
        setCachedReports(prev => ({ ...prev, [eventId]: report }));
        return report;
      }
      // Return cached report if available
      return cachedReports[eventId] || null;
    } catch (err) {
      console.warn('Failed to fetch attendance report:', err);
      return cachedReports[eventId] || null;
    }
  };

  /**
   * Export CSV report for an event
   */
  const exportCsvReport = async (eventId, eventTitle = 'Event') => {
    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + (currentUser?.uid || 'fac-001');
      const blob = await flaskApi.exportAttendanceCsv(eventId, token);

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = (eventTitle || 'Campus_Event').replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `CLIDGE_Attendance_Report_${cleanTitle}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setNotification({
          type: 'success',
          message: 'Attendance CSV report downloaded successfully!'
        });
        return true;
      }
      throw new Error('Could not download CSV');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
      return false;
    }
  };

  /**
   * Fetch student personal participation history
   */
  const fetchStudentHistory = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'student') return [];
    setIsLoadingHistory(true);
    try {
      const token = await currentUser?.getIdToken?.().catch(() => null) || 'dev-token-' + currentUser.uid;
      const res = await flaskApi.getStudentAttendanceHistory(token);
      if (res && res.success) {
        setStudentHistory(res.history || []);
        return res.history;
      }
      // Fallback to local cached attendance
      const cached = await offlineStorage.getCachedAttendance();
      setStudentHistory(cached);
      return cached;
    } catch (err) {
      console.warn('Error fetching history:', err);
      const cached = await offlineStorage.getCachedAttendance();
      setStudentHistory(cached);
      return cached;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'student') {
      fetchStudentHistory();
    }
  }, [currentUser, fetchStudentHistory]);

  const value = {
    isOnline,
    wasOffline,
    pendingItems,
    pendingCount: pendingItems.length,
    isSyncing,
    lastSyncResult,
    notification,
    setNotification,
    generateEventQr,
    getEventQr,
    checkIn,
    checkOut,
    syncPendingNow,
    fetchAttendanceReport,
    exportCsvReport,
    studentHistory,
    isLoadingHistory,
    fetchStudentHistory,
    refreshPendingQueue
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export default AttendanceContext;
