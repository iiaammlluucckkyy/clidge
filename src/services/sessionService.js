/**
 * Real-Time Location Session Service
 * Connects Faculty ("Start location session" -> Session Code + QR Link -> "End session")
 * with Students ("Enter code or open QR link" -> "Start sharing" / "Stop sharing")
 * strictly scoped per collegeCode across real phones via Cloud Firestore.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, isLiveFirebase } from './authService.js';

const LOCAL_SESSIONS_KEY = 'clidge_location_sessions_v1';
const LOCAL_SESSION_LOCATIONS_KEY = 'clidge_session_locations_v1';
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

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateSessionCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
};

const readLocalSessions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeLocalSessions = (map) => {
  try {
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(map));
  } catch {}
};

const readLocalLocations = () => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_LOCATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeLocalLocations = (map) => {
  try {
    localStorage.setItem(LOCAL_SESSION_LOCATIONS_KEY, JSON.stringify(map));
  } catch {}
};

/**
 * Faculty starts a new live location session for their college.
 */
export const startLocationSession = async ({ facultyUser, title = 'Live Campus Location Session' }) => {
  if (!facultyUser || facultyUser.role !== 'teacher') {
    throw new Error('Only verified faculty accounts can start location sessions.');
  }
  if (!facultyUser.collegeCode) {
    throw new Error('Faculty profile is missing a college code.');
  }

  let sessionCode = generateSessionCode();
  const sessions = readLocalSessions();

  if (isLiveFirebase()) {
    // Ensure unique session code in Firestore
    for (let attempt = 0; attempt < 5; attempt++) {
      const existingSnap = await getDoc(doc(db, 'sessions', sessionCode));
      if (!existingSnap.exists()) break;
      sessionCode = generateSessionCode();
    }
  } else {
    while (sessions[sessionCode]) {
      sessionCode = generateSessionCode();
    }
  }

  const sessionRecord = {
    sessionCode,
    title: title.trim() || 'Live Campus Location Session',
    collegeCode: facultyUser.collegeCode,
    collegeName: facultyUser.collegeName || 'Campus',
    facultyUid: facultyUser.uid,
    facultyName: facultyUser.name,
    active: true,
    createdAt: new Date().toISOString()
  };

  if (isLiveFirebase()) {
    await setDoc(doc(db, 'sessions', sessionCode), {
      ...sessionRecord,
      createdAt: serverTimestamp()
    });
  }

  sessions[sessionCode] = sessionRecord;
  writeLocalSessions(sessions);
  postBroadcast('SESSIONS_UPDATED', { sessionCode, collegeCode: facultyUser.collegeCode });

  return sessionRecord;
};

/**
 * Faculty ends an active location session.
 */
export const endLocationSession = async ({ sessionCode, facultyUser }) => {
  if (!sessionCode) throw new Error('Session code is required.');
  if (!facultyUser || facultyUser.role !== 'teacher') {
    throw new Error('Only faculty can end a location session.');
  }
  const cleanCode = sessionCode.trim().toUpperCase();

  if (isLiveFirebase()) {
    await updateDoc(doc(db, 'sessions', cleanCode), {
      active: false,
      endedAt: serverTimestamp()
    });
  }

  const sessions = readLocalSessions();
  if (sessions[cleanCode]) {
    sessions[cleanCode] = {
      ...sessions[cleanCode],
      active: false,
      endedAt: new Date().toISOString()
    };
    writeLocalSessions(sessions);
  }
  postBroadcast('SESSIONS_UPDATED', { sessionCode: cleanCode, collegeCode: facultyUser.collegeCode });
  return true;
};

/**
 * Validates that a session code exists, is active, and belongs to the student's college.
 */
export const validateSessionForStudent = async (sessionCode, studentUser) => {
  if (!sessionCode?.trim()) throw new Error('Please enter the session code or scan a QR code.');
  const cleanCode = sessionCode.trim().toUpperCase();

  let session = null;

  if (isLiveFirebase()) {
    try {
      const snap = await getDoc(doc(db, 'sessions', cleanCode));
      if (snap.exists()) {
        const data = snap.data();
        session = {
          ...data,
          sessionCode: snap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        };
      }
    } catch (err) {
      if (err.code === 'permission-denied') {
        throw new Error('Access Denied: That session belongs to another college or you do not have access.');
      }
      throw err;
    }
  } else {
    const sessions = readLocalSessions();
    session = sessions[cleanCode] || null;
  }

  if (!session) {
    throw new Error(`No session found with code "${cleanCode}". Ask your faculty for the current session code.`);
  }

  if (studentUser?.collegeCode && session.collegeCode !== studentUser.collegeCode) {
    throw new Error('Access Denied: You cannot join a session from another college.');
  }

  if (!session.active) {
    throw new Error('This location session has already ended.');
  }

  return session;
};

/**
 * Subscribe to the active session(s) created by this college's faculty.
 */
export const subscribeCollegeSessions = (collegeCode, callback) => {
  if (!collegeCode) {
    callback([]);
    return () => {};
  }

  if (isLiveFirebase()) {
    const q = query(
      collection(db, 'sessions'),
      where('collegeCode', '==', collegeCode),
      where('active', '==', true)
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => {
          const data = d.data();
          return {
            ...data,
            sessionCode: d.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(list);
      },
      (err) => {
        console.warn('Sessions listener error:', err.message);
        const all = Object.values(readLocalSessions()).filter(s => s.collegeCode === collegeCode && s.active);
        callback(all);
      }
    );
  }

  const emitLocal = () => {
    const all = Object.values(readLocalSessions())
      .filter(s => s.collegeCode === collegeCode && s.active)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    callback(all);
  };

  emitLocal();
  let ch = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel(BROADCAST_NAME);
      ch.onmessage = (e) => {
        if (e.data?.type === 'SESSIONS_UPDATED') emitLocal();
      };
    }
  } catch {}
  const onStorage = (e) => {
    if (e.key === LOCAL_SESSIONS_KEY) emitLocal();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

  return () => {
    if (ch) ch.close();
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
};

/**
 * Subscribe to one specific session document (for students to detect "End session" immediately).
 */
export const subscribeSingleSession = (sessionCode, callback) => {
  if (!sessionCode) return () => {};
  const cleanCode = sessionCode.trim().toUpperCase();

  if (isLiveFirebase()) {
    return onSnapshot(
      doc(db, 'sessions', cleanCode),
      (snap) => {
        if (!snap.exists()) {
          callback(null);
          return;
        }
        const data = snap.data();
        callback({
          ...data,
          sessionCode: snap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      },
      () => callback(null)
    );
  }

  const emit = () => {
    const sessions = readLocalSessions();
    callback(sessions[cleanCode] || null);
  };
  emit();

  let ch = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel(BROADCAST_NAME);
      ch.onmessage = (e) => {
        if (e.data?.type === 'SESSIONS_UPDATED') emit();
      };
    }
  } catch {}
  const onStorage = (e) => {
    if (e.key === LOCAL_SESSIONS_KEY) emit();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

  return () => {
    if (ch) ch.close();
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
};

/**
 * Student publishes real-time GPS location into an active session.
 */
export const publishStudentSessionLocation = async (sessionCode, studentUser, locPayload) => {
  if (!sessionCode || !studentUser?.uid) return;
  const cleanCode = sessionCode.trim().toUpperCase();
  const nowIso = new Date().toISOString();

  const record = {
    studentUid: studentUser.uid,
    name: studentUser.name || 'Student',
    email: studentUser.email || '',
    regNumber: studentUser.registrationNumber || studentUser.regNumber || '',
    collegeCode: studentUser.collegeCode || 'DEFAULT',
    latitude: Number(locPayload.latitude),
    longitude: Number(locPayload.longitude),
    accuracy: Math.round(Number(locPayload.accuracy) || 0),
    placeName: locPayload.placeName || 'Locating...',
    zoneName: locPayload.zoneName || null,
    isInsideZone: Boolean(locPayload.isInsideZone),
    isSharing: true,
    updatedAt: nowIso
  };

  if (isLiveFirebase()) {
    await setDoc(doc(db, 'sessions', cleanCode, 'locations', studentUser.uid), {
      ...record,
      updatedAtServer: serverTimestamp()
    });
  }

  const allLocs = readLocalLocations();
  if (!allLocs[cleanCode]) allLocs[cleanCode] = {};
  allLocs[cleanCode][studentUser.uid] = record;
  writeLocalLocations(allLocs);
  postBroadcast('LOCATIONS_UPDATED', { sessionCode: cleanCode });

  return record;
};

/**
 * Student stops sharing location in a session (preserves last place or marks stopped).
 */
export const stopStudentSessionLocation = async (sessionCode, studentUser) => {
  if (!sessionCode || !studentUser?.uid) return;
  const cleanCode = sessionCode.trim().toUpperCase();
  const nowIso = new Date().toISOString();

  if (isLiveFirebase()) {
    try {
      await setDoc(
        doc(db, 'sessions', cleanCode, 'locations', studentUser.uid),
        {
          studentUid: studentUser.uid,
          collegeCode: studentUser.collegeCode || 'DEFAULT',
          isSharing: false,
          stoppedAt: nowIso,
          updatedAtServer: serverTimestamp()
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore stopStudentSessionLocation error:', err.message);
    }
  }

  const allLocs = readLocalLocations();
  if (allLocs[cleanCode]?.[studentUser.uid]) {
    allLocs[cleanCode][studentUser.uid] = {
      ...allLocs[cleanCode][studentUser.uid],
      isSharing: false,
      stoppedAt: nowIso
    };
    writeLocalLocations(allLocs);
    postBroadcast('LOCATIONS_UPDATED', { sessionCode: cleanCode });
  }
};

/**
 * Faculty subscribes in real time to ALL sharing students in an active session.
 */
export const subscribeSessionStudentLocations = (sessionCode, callback) => {
  if (!sessionCode) {
    callback([]);
    return () => {};
  }
  const cleanCode = sessionCode.trim().toUpperCase();

  if (isLiveFirebase()) {
    const colRef = collection(db, 'sessions', cleanCode, 'locations');
    return onSnapshot(
      colRef,
      (snap) => {
        const list = snap.docs.map(d => {
          const data = d.data();
          const serverTime = data.updatedAtServer?.toDate
            ? data.updatedAtServer.toDate().toISOString()
            : data.updatedAt;
          return {
            id: d.id,
            ...data,
            updatedAt: serverTime || data.updatedAt
          };
        });
        callback(list);
      },
      (err) => {
        console.warn('Session locations listener error:', err.message);
        const all = readLocalLocations();
        callback(Object.values(all[cleanCode] || {}));
      }
    );
  }

  const emitLocal = () => {
    const all = readLocalLocations();
    callback(Object.values(all[cleanCode] || {}));
  };
  emitLocal();

  let ch = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel(BROADCAST_NAME);
      ch.onmessage = (e) => {
        if (e.data?.type === 'LOCATIONS_UPDATED' && e.data?.payload?.sessionCode === cleanCode) {
          emitLocal();
        }
      };
    }
  } catch {}
  const onStorage = (e) => {
    if (e.key === LOCAL_SESSION_LOCATIONS_KEY) emitLocal();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

  return () => {
    if (ch) ch.close();
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
};
