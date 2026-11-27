import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, isLiveFirebase } from './authService.js';

// Local persistence keys (v6 — strictly ZERO pre-populated fake events!)
const LOCAL_EVENTS_KEY = 'clidge_persisted_events_v6';
const LOCAL_PARTICIPANTS_KEY = 'clidge_persisted_participants_v6';
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

// Always start completely empty — NEVER show fake/sample events for new colleges/students!
const DEFAULT_INITIAL_EVENTS = [];
const DEFAULT_INITIAL_PARTICIPANTS = [];

export const getLocalEvents = () => {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(DEFAULT_INITIAL_EVENTS));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLocalEvents = (events) => {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Error saving local events:', err);
  }
};

export const getLocalParticipants = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PARTICIPANTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(DEFAULT_INITIAL_PARTICIPANTS));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLocalParticipants = (participants) => {
  try {
    localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(participants));
  } catch (err) {
    console.error('Error saving local participants:', err);
  }
};

/**
 * 1. FETCH ALL EVENTS (Scoped by collegeCode when provided)
 */
export const fetchAllEvents = async (collegeCode = null) => {
  if (isLiveFirebase() && collegeCode) {
    try {
      const q = query(collection(db, 'events'), where('collegeCode', '==', collegeCode));
      const snap = await getDocs(q);
      const events = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          eventId: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        };
      });
      return events;
    } catch (err) {
      console.warn('Firestore fetchAllEvents fallback:', err.message);
    }
  }
  const all = getLocalEvents();
  if (!collegeCode) return all;
  return all.filter(e => e.collegeCode === collegeCode);
};

/**
 * Real-time subscription to events for a specific college.
 */
export const subscribeCollegeEvents = (collegeCode, callback) => {
  if (!collegeCode) {
    callback([]);
    return () => {};
  }

  if (isLiveFirebase()) {
    const q = query(collection(db, 'events'), where('collegeCode', '==', collegeCode));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            eventId: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          };
        });
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(list);
      },
      (err) => {
        console.warn('Events listener error:', err.message);
        callback(getLocalEvents().filter(e => e.collegeCode === collegeCode));
      }
    );
  }

  const emit = () => {
    const list = getLocalEvents().filter(e => e.collegeCode === collegeCode);
    callback(list);
  };
  emit();

  let ch = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel(BROADCAST_NAME);
      ch.onmessage = (e) => {
        if (e.data?.type === 'EVENTS_UPDATED') emit();
      };
    }
  } catch {}
  const onStorage = (e) => {
    if (e.key === LOCAL_EVENTS_KEY) emit();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

  return () => {
    if (ch) ch.close();
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
};

/**
 * 2. CREATE AN EVENT (FACULTY ONLY, SCOPED TO COLLEGE)
 */
export const createEventRecord = async (eventData, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');
  if (currentUser.role !== 'teacher') {
    throw new Error('Unauthorized: Only verified faculty/teachers can create events.');
  }

  if (!eventData.title?.trim()) throw new Error('Event title is required.');
  if (!eventData.description?.trim()) throw new Error('Event description is required.');
  if (!eventData.venue?.trim()) throw new Error('Event place / venue is required.');
  if (!eventData.date?.trim()) throw new Error('Event date is required.');

  const startTime = (eventData.startTime || eventData.time || '09:00 AM').trim();
  const endTime = (eventData.endTime || '05:00 PM').trim();
  const lat = eventData.latitude !== undefined && eventData.latitude !== '' ? Number(eventData.latitude) : 0;
  const lng = eventData.longitude !== undefined && eventData.longitude !== '' ? Number(eventData.longitude) : 0;
  const radius = Number(eventData.radius) || 65;

  const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const now = new Date().toISOString();
  const collegeCode = currentUser.collegeCode || 'MEC001';

  const newEvent = {
    id: eventId,
    eventId: eventId,
    title: eventData.title.trim(),
    description: eventData.description.trim(),
    venue: eventData.venue.trim(),
    date: eventData.date.trim(),
    startTime,
    endTime,
    latitude: lat,
    longitude: lng,
    radius,
    imageUrl: eventData.imageUrl?.trim() || '',
    category: eventData.category || 'Campus Event',
    collegeCode,
    collegeName: currentUser.collegeName || 'Campus',
    teacherId: currentUser.uid,
    teacherName: currentUser.name,
    teacherEmail: currentUser.email,
    teacherDepartment: currentUser.department || 'General',
    status: 'Upcoming',
    registeredCount: 0,
    maxCapacity: Number(eventData.maxCapacity) || 200,
    createdAt: now,
    updatedAt: now
  };

  if (isLiveFirebase()) {
    await setDoc(doc(db, 'events', eventId), {
      ...newEvent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  const events = getLocalEvents();
  events.unshift(newEvent);
  saveLocalEvents(events);
  postBroadcast('EVENTS_UPDATED', { collegeCode });
  return newEvent;
};

/**
 * DELETE AN EVENT (FACULTY ONLY, SAME COLLEGE)
 */
export const deleteEventRecord = async (eventId, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');
  if (currentUser.role !== 'teacher') {
    throw new Error('Unauthorized: Only faculty can delete events.');
  }

  const events = getLocalEvents();
  const target = events.find(e => e.id === eventId || e.eventId === eventId);
  if (target && currentUser.collegeCode && target.collegeCode && target.collegeCode !== currentUser.collegeCode) {
    throw new Error('Unauthorized: You cannot delete an event from another college.');
  }

  if (isLiveFirebase()) {
    await deleteDoc(doc(db, 'events', eventId));
  }

  const updated = events.filter(e => e.id !== eventId && e.eventId !== eventId);
  saveLocalEvents(updated);
  postBroadcast('EVENTS_UPDATED', { collegeCode: currentUser.collegeCode });
  return true;
};

/**
 * 3. EDIT EVENT INFORMATION (FACULTY ONLY)
 */
export const updateEventRecord = async (eventId, updateData, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');
  if (currentUser.role !== 'teacher') {
    throw new Error('Unauthorized: Only teachers can edit events.');
  }

  const events = getLocalEvents();
  const eventIdx = events.findIndex(e => e.id === eventId || e.eventId === eventId);
  if (eventIdx === -1) throw new Error('Event not found.');

  const targetEvent = events[eventIdx];
  const sameCollege = !currentUser.collegeCode || !targetEvent.collegeCode || targetEvent.collegeCode === currentUser.collegeCode;
  const isAuthorized = sameCollege && (targetEvent.teacherId === currentUser.uid || currentUser.role === 'teacher');
  if (!isAuthorized) {
    throw new Error('Unauthorized: You can only edit events in your own college.');
  }

  const now = new Date().toISOString();
  const updatedEvent = {
    ...targetEvent,
    ...updateData,
    latitude: updateData.latitude !== undefined ? Number(updateData.latitude) : targetEvent.latitude,
    longitude: updateData.longitude !== undefined ? Number(updateData.longitude) : targetEvent.longitude,
    radius: updateData.radius !== undefined ? Number(updateData.radius) : targetEvent.radius,
    updatedAt: now
  };

  if (isLiveFirebase()) {
    await updateDoc(doc(db, 'events', eventId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  }

  events[eventIdx] = updatedEvent;
  saveLocalEvents(events);
  postBroadcast('EVENTS_UPDATED', { collegeCode: targetEvent.collegeCode });
  return updatedEvent;
};

/**
 * 4. CANCEL AN EVENT
 */
export const cancelEventRecord = async (eventId, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');
  if (currentUser.role !== 'teacher') {
    throw new Error('Unauthorized: Only teachers can cancel events.');
  }

  const events = getLocalEvents();
  const eventIdx = events.findIndex(e => e.id === eventId || e.eventId === eventId);
  if (eventIdx === -1) throw new Error('Event not found.');

  const targetEvent = events[eventIdx];
  const now = new Date().toISOString();
  events[eventIdx] = { ...targetEvent, status: 'Cancelled', updatedAt: now };
  saveLocalEvents(events);

  const participants = getLocalParticipants();
  saveLocalParticipants(participants.map(p => (p.eventId === eventId && p.sharingStatus !== 'Left' ? { ...p, sharingStatus: 'Ended' } : p)));

  if (isLiveFirebase()) {
    try {
      await updateDoc(doc(db, 'events', eventId), { status: 'Cancelled', updatedAt: serverTimestamp() });
    } catch {}
  }

  postBroadcast('EVENTS_UPDATED', { collegeCode: targetEvent.collegeCode });
  return events[eventIdx];
};

/**
 * 5. END AN EVENT
 */
export const endEventRecord = async (eventId, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');
  if (currentUser.role !== 'teacher') {
    throw new Error('Unauthorized: Only teachers can end events.');
  }

  const events = getLocalEvents();
  const eventIdx = events.findIndex(e => e.id === eventId || e.eventId === eventId);
  if (eventIdx === -1) throw new Error('Event not found.');

  const targetEvent = events[eventIdx];
  const now = new Date().toISOString();
  events[eventIdx] = { ...targetEvent, status: 'Completed', updatedAt: now };
  saveLocalEvents(events);

  const participants = getLocalParticipants();
  saveLocalParticipants(participants.map(p => (p.eventId === eventId && p.sharingStatus !== 'Left' ? { ...p, sharingStatus: 'Ended' } : p)));

  if (isLiveFirebase()) {
    try {
      await updateDoc(doc(db, 'events', eventId), { status: 'Completed', updatedAt: serverTimestamp() });
    } catch {}
  }

  postBroadcast('EVENTS_UPDATED', { collegeCode: targetEvent.collegeCode });
  return events[eventIdx];
};

/**
 * 6. VIEW REGISTERED PARTICIPANTS
 */
export const fetchEventParticipants = async (eventId, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');

  if (isLiveFirebase()) {
    try {
      const q = query(collection(db, 'eventParticipants'), where('eventId', '==', eventId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch {}
  }

  const participants = getLocalParticipants();
  return participants.filter(p => p.eventId === eventId && p.sharingStatus !== 'Left');
};

/**
 * 7. STUDENT JOIN AN EVENT
 */
export const joinEventRecord = async (eventId, currentUser, sharingConsent) => {
  if (!currentUser) throw new Error('Authentication required. Please sign in to join events.');
  if (currentUser.role !== 'student') {
    throw new Error('Only student accounts can join campus events.');
  }
  if (!sharingConsent) {
    throw new Error('Voluntary location sharing consent is required to participate in this geofenced event.');
  }

  const events = getLocalEvents();
  const eventIdx = events.findIndex(e => e.id === eventId || e.eventId === eventId);
  if (eventIdx === -1) throw new Error('Event not found.');

  const targetEvent = events[eventIdx];
  if (currentUser.collegeCode && targetEvent.collegeCode && targetEvent.collegeCode !== currentUser.collegeCode) {
    throw new Error('Access Denied: You cannot join an event from another college.');
  }
  if (targetEvent.status === 'Cancelled') {
    throw new Error('Cannot join this event because it has been cancelled by the faculty.');
  }
  if (targetEvent.status === 'Completed') {
    throw new Error('Cannot join this event because it has already ended.');
  }

  const participants = getLocalParticipants();
  const existing = participants.find(
    p => p.eventId === eventId && p.studentId === currentUser.uid && p.sharingStatus !== 'Left'
  );
  if (existing) {
    throw new Error('You are already registered for this campus event.');
  }

  const participantId = `${eventId}_${currentUser.uid}`;
  const now = new Date().toISOString();
  const sharingStatus = targetEvent.status === 'Ongoing' ? 'Active' : 'Pending';

  const newParticipant = {
    id: participantId,
    eventId,
    collegeCode: targetEvent.collegeCode || currentUser.collegeCode || 'MEC001',
    studentId: currentUser.uid,
    studentName: currentUser.name,
    studentRegNumber: currentUser.registrationNumber || currentUser.regNumber || 'REG-PENDING',
    studentEmail: currentUser.email,
    studentDepartment: currentUser.department || 'General',
    studentYear: currentUser.year || 'Student',
    joinedAt: now,
    sharingConsent: true,
    sharingStatus
  };

  if (isLiveFirebase()) {
    try {
      await setDoc(doc(db, 'eventParticipants', participantId), {
        ...newParticipant,
        joinedAt: serverTimestamp()
      });
    } catch {}
  }

  const existingIdx = participants.findIndex(p => p.id === participantId);
  if (existingIdx >= 0) {
    participants[existingIdx] = newParticipant;
  } else {
    participants.push(newParticipant);
  }
  saveLocalParticipants(participants);

  events[eventIdx] = { ...targetEvent, registeredCount: (targetEvent.registeredCount || 0) + 1 };
  saveLocalEvents(events);
  return { participant: newParticipant, event: events[eventIdx] };
};

/**
 * 8. STUDENT LEAVE AN EVENT
 */
export const leaveEventRecord = async (eventId, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');

  const events = getLocalEvents();
  const eventIdx = events.findIndex(e => e.id === eventId || e.eventId === eventId);
  if (eventIdx === -1) throw new Error('Event not found.');

  const targetEvent = events[eventIdx];
  if (targetEvent.status === 'Completed') {
    throw new Error('Cannot leave a completed event session.');
  }

  const participantId = `${eventId}_${currentUser.uid}`;
  const participants = getLocalParticipants();
  const pIdx = participants.findIndex(p => p.id === participantId || (p.eventId === eventId && p.studentId === currentUser.uid));
  if (pIdx === -1 || participants[pIdx].sharingStatus === 'Left') {
    throw new Error('You are not currently registered for this event.');
  }

  participants[pIdx] = { ...participants[pIdx], sharingStatus: 'Left' };
  saveLocalParticipants(participants);

  events[eventIdx] = { ...targetEvent, registeredCount: Math.max(0, (targetEvent.registeredCount || 1) - 1) };
  saveLocalEvents(events);

  if (isLiveFirebase()) {
    try {
      await updateDoc(doc(db, 'eventParticipants', participantId), { sharingStatus: 'Left' });
    } catch {}
  }

  return { success: true, event: events[eventIdx] };
};

/**
 * 9. GET JOINED EVENTS FOR A STUDENT
 */
export const fetchStudentJoinedEvents = async (studentId) => {
  const participants = getLocalParticipants();
  const myRegistrations = participants.filter(
    p => p.studentId === studentId && p.sharingStatus !== 'Left'
  );
  const events = getLocalEvents();
  return myRegistrations
    .map(reg => {
      const event = events.find(e => e.id === reg.eventId || e.eventId === reg.eventId);
      return event ? { ...event, participation: reg } : null;
    })
    .filter(Boolean);
};
