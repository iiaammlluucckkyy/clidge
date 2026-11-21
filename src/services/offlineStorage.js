/**
 * CLIDGE IndexedDB Offline Storage Service
 * 
 * Provides robust offline-first caching for:
 * 1. Permitted campus event details.
 * 2. Pending attendance transactions (check-ins and check-outs queued while offline).
 * 3. Cached verified attendance history for local display.
 * 
 * Critical Guarantees:
 * - Does NOT claim offline records are live.
 * - Does NOT treat locally saved scans as verified until server confirms.
 * - Stores unique syncId to prevent duplicate synchronization.
 * - Preserves original offline timestamp for server audit trail.
 * - Does NOT store unnecessary or continuous location traces offline.
 */

const DB_NAME = 'clidge_campus_offline_db_v1';
const DB_VERSION = 1;

const STORES = {
  EVENTS: 'permitted_events',
  PENDING_ATTENDANCE: 'pending_attendance',
  CACHED_ATTENDANCE: 'cached_attendance_history'
};

class OfflineStorageService {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  /**
   * Initializes or opens the IndexedDB instance.
   */
  async getDb() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this environment.'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store 1: Permitted Events
        if (!db.objectStoreNames.contains(STORES.EVENTS)) {
          db.createObjectStore(STORES.EVENTS, { keyPath: 'id' });
        }

        // Store 2: Pending Attendance Queue
        if (!db.objectStoreNames.contains(STORES.PENDING_ATTENDANCE)) {
          const pendingStore = db.createObjectStore(STORES.PENDING_ATTENDANCE, { keyPath: 'syncId' });
          pendingStore.createIndex('eventId', 'eventId', { unique: false });
          pendingStore.createIndex('status', 'status', { unique: false });
        }

        // Store 3: Cached Attendance History
        if (!db.objectStoreNames.contains(STORES.CACHED_ATTENDANCE)) {
          db.createObjectStore(STORES.CACHED_ATTENDANCE, { keyPath: 'attendanceId' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  /**
   * Caches permitted event records for offline viewing.
   */
  async savePermittedEvents(events) {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.EVENTS, 'readwrite');
      const store = tx.objectStore(STORES.EVENTS);

      events.forEach((evt) => {
        const record = {
          ...evt,
          id: evt.id || evt.eventId,
          cachedAt: new Date().toISOString()
        };
        store.put(record);
      });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to cache events in IndexedDB:', err);
      return false;
    }
  }

  /**
   * Retrieves permitted cached events from IndexedDB.
   */
  async getCachedEvents() {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.EVENTS, 'readonly');
      const store = tx.objectStore(STORES.EVENTS);
      const req = store.getAll();

      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to read cached events from IndexedDB:', err);
      return [];
    }
  }

  /**
   * Queues an offline attendance check-in or check-out.
   * 
   * Strict Safety Rule:
   * Status is explicitly 'PENDING_VERIFICATION'. It is NEVER marked as verified or LIVE locally.
   */
  async queuePendingAttendance({ eventId, eventTitle, action, qrToken, studentId, studentName }) {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.PENDING_ATTENDANCE, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_ATTENDANCE);

      const syncId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const offlineTimestamp = new Date().toISOString();

      const pendingRecord = {
        syncId,
        eventId,
        eventTitle: eventTitle || 'Campus Event',
        action: action || 'check-in', // 'check-in' or 'check-out'
        qrToken,
        studentId,
        studentName,
        offlineTimestamp,
        status: 'PENDING_VERIFICATION', // NEVER 'LIVE'
        retryCount: 0,
        queuedAt: offlineTimestamp
      };

      store.add(pendingRecord);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(pendingRecord);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('Failed to queue pending attendance in IndexedDB:', err);
      throw err;
    }
  }

  /**
   * Retrieves all pending attendance records waiting for network synchronization.
   */
  async getPendingAttendance() {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.PENDING_ATTENDANCE, 'readonly');
      const store = tx.objectStore(STORES.PENDING_ATTENDANCE);
      const req = store.getAll();

      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to retrieve pending attendance:', err);
      return [];
    }
  }

  /**
   * Removes a pending record after successful server synchronization.
   */
  async removePendingAttendance(syncId) {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.PENDING_ATTENDANCE, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_ATTENDANCE);
      store.delete(syncId);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to remove pending attendance:', err);
      return false;
    }
  }

  /**
   * Caches verified attendance records for offline display.
   */
  async saveCachedAttendance(records) {
    if (!Array.isArray(records)) return;
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.CACHED_ATTENDANCE, 'readwrite');
      const store = tx.objectStore(STORES.CACHED_ATTENDANCE);

      records.forEach((rec) => {
        if (rec.attendanceId) {
          store.put(rec);
        }
      });

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
      });
    } catch (err) {
      console.warn('Failed to cache attendance records:', err);
    }
  }

  /**
   * Retrieves cached attendance history.
   */
  async getCachedAttendance() {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.CACHED_ATTENDANCE, 'readonly');
      const store = tx.objectStore(STORES.CACHED_ATTENDANCE);
      const req = store.getAll();

      return new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Clears all stores (e.g., on logout).
   */
  async clearAll() {
    try {
      const db = await this.getDb();
      const tx = db.transaction([STORES.EVENTS, STORES.PENDING_ATTENDANCE, STORES.CACHED_ATTENDANCE], 'readwrite');
      tx.objectStore(STORES.EVENTS).clear();
      tx.objectStore(STORES.PENDING_ATTENDANCE).clear();
      tx.objectStore(STORES.CACHED_ATTENDANCE).clear();
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
      });
    } catch {
      return false;
    }
  }
}

export const offlineStorage = new OfflineStorageService();
export default offlineStorage;
