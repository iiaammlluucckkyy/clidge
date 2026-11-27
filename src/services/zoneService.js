/**
 * College Campus Zones Service
 * Scoped strictly per collegeCode.
 * A new college always starts completely empty (0 zones).
 * Uses Cloud Firestore in live mode, and localStorage + BroadcastChannel in Demo Mode.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db, isLiveFirebase } from './authService.js';

const LOCAL_ZONES_KEY = 'clidge_college_zones_v1';
const BROADCAST_NAME = 'clidge_realtime_sync';

const postBroadcast = (type, payload) => {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(BROADCAST_NAME);
      ch.postMessage({ type, payload, at: Date.now() });
      ch.close();
    }
  } catch {}
};

export const getLocalZones = (collegeCode) => {
  try {
    const raw = localStorage.getItem(LOCAL_ZONES_KEY);
    const all = raw ? JSON.parse(raw) : [];
    if (!collegeCode) return all;
    return all.filter(z => z.collegeCode === collegeCode);
  } catch {
    return [];
  }
};

const saveAllLocalZones = (zones) => {
  try {
    localStorage.setItem(LOCAL_ZONES_KEY, JSON.stringify(zones));
  } catch {}
};

/**
 * Create a campus zone for a faculty member's college.
 */
export const createCollegeZone = async ({ name, latitude, longitude, radius = 60, color = '#06b6d4', category = 'Campus Building' }, currentUser) => {
  if (!currentUser || currentUser.role !== 'teacher') {
    throw new Error('Only faculty accounts can create campus zones.');
  }
  if (!name?.trim()) throw new Error('Zone name is required (e.g. Hostel, Canteen, Library).');
  const lat = Number(latitude);
  const lng = Number(longitude);
  const rad = Math.max(15, Math.min(2000, Number(radius) || 60));
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error('Tap the map or use your GPS to set the zone location first.');
  }

  const collegeCode = currentUser.collegeCode || 'DEFAULT';
  const id = `zone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const zoneRecord = {
    id,
    name: name.trim(),
    category,
    latitude: lat,
    longitude: lng,
    radius: rad,
    color,
    collegeCode,
    collegeName: currentUser.collegeName || 'Campus',
    createdBy: currentUser.uid,
    createdByName: currentUser.name,
    createdAt: new Date().toISOString()
  };

  if (isLiveFirebase()) {
    await setDoc(doc(db, 'zones', id), {
      ...zoneRecord,
      createdAt: serverTimestamp()
    });
  }

  const existing = getLocalZones();
  existing.unshift(zoneRecord);
  saveAllLocalZones(existing);
  postBroadcast('ZONES_UPDATED', { collegeCode });

  return zoneRecord;
};

/**
 * Delete a campus zone belonging to the faculty member's college.
 */
export const deleteCollegeZone = async (zoneId, currentUser) => {
  if (!currentUser || currentUser.role !== 'teacher') {
    throw new Error('Only faculty accounts can delete campus zones.');
  }
  const existing = getLocalZones();
  const target = existing.find(z => z.id === zoneId);
  if (target && target.collegeCode !== currentUser.collegeCode) {
    throw new Error('Access Denied: Cannot delete a zone from another college.');
  }

  if (isLiveFirebase()) {
    await deleteDoc(doc(db, 'zones', zoneId));
  }

  const filtered = existing.filter(z => z.id !== zoneId);
  saveAllLocalZones(filtered);
  postBroadcast('ZONES_UPDATED', { collegeCode: currentUser.collegeCode });
  return true;
};

/**
 * Fetch zones once for a college.
 */
export const fetchCollegeZones = async (collegeCode) => {
  if (!collegeCode) return [];
  if (isLiveFirebase()) {
    try {
      const q = query(collection(db, 'zones'), where('collegeCode', '==', collegeCode));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return list;
    } catch (err) {
      console.warn('Firestore fetchCollegeZones error:', err.message);
    }
  }
  return getLocalZones(collegeCode);
};

/**
 * Real-time subscription to zones for a specific college.
 */
export const subscribeCollegeZones = (collegeCode, callback) => {
  if (!collegeCode) {
    callback([]);
    return () => {};
  }

  if (isLiveFirebase()) {
    const q = query(collection(db, 'zones'), where('collegeCode', '==', collegeCode));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(list);
      },
      (err) => {
        console.warn('Zones listener fallback:', err.message);
        callback(getLocalZones(collegeCode));
      }
    );
  }

  // Demo Mode: emit initial + listen to cross-tab storage & BroadcastChannel
  callback(getLocalZones(collegeCode));
  const notify = () => callback(getLocalZones(collegeCode));

  let ch = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel(BROADCAST_NAME);
      ch.onmessage = (e) => {
        if (e.data?.type === 'ZONES_UPDATED') notify();
      };
    }
  } catch {}

  const onStorage = (e) => {
    if (e.key === LOCAL_ZONES_KEY) notify();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    if (ch) ch.close();
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
};
