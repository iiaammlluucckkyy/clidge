import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db, isLiveFirebase } from './authService.js';
import { CAMPUS_ZONES } from '../data/campusZones.js';

// Local persistence keys (v5 with Muthayammal Engineering College GNSS calibration)
const LOCAL_EVENTS_KEY = 'clidge_persisted_events_v5';
const LOCAL_PARTICIPANTS_KEY = 'clidge_persisted_participants_v5';

// Default initial events formatted to schema (Muthayammal Engineering College campus venues)
const DEFAULT_INITIAL_EVENTS = [
  {
    id: 'evt-2026-001',
    eventId: 'evt-2026-001',
    title: 'National Level Workshop on Generative AI & Autonomous Agents',
    description: 'Hands-on symposium exploring foundational LLM architecture, agent tool calling, and full-stack integration with React and cloud backends.',
    venue: 'Main Auditorium (Kamarajar Hall)',
    date: '2026-11-20',
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    latitude: 11.4448,
    longitude: 78.2263,
    radius: 65,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    teacherId: 'fac-indrapriyadharshini-uid',
    teacherName: 'Prof. Indrapriyadharshini',
    teacherEmail: 'indrapriyadharshini@clidge.edu.in',
    teacherDepartment: 'Computer Science and Engineering',
    category: 'Technical Workshop',
    status: 'Ongoing',
    registeredCount: 3,
    maxCapacity: 350,
    createdAt: '2026-11-10T09:00:00.000Z',
    updatedAt: '2026-11-10T09:00:00.000Z'
  },
  {
    id: 'evt-2026-002',
    eventId: 'evt-2026-002',
    title: 'Smart Campus IoT & Geofencing Systems Seminar',
    description: 'Technical lecture on LoRaWAN, BLE beacons, and smartphone GNSS integration for indoor and campus-wide perimeter monitoring.',
    venue: 'CSE Department Seminar Hall (Hall 302)',
    date: '2026-11-21',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    latitude: 11.4452,
    longitude: 78.2267,
    radius: 45,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
    teacherId: 'fac-hod-kavita-uid',
    teacherName: 'Dr. G. Kavita, Ph.D.',
    teacherEmail: 'kavita.hod@clidge.edu.in',
    teacherDepartment: 'Computer Science and Engineering',
    category: 'Guest Lecture',
    status: 'Upcoming',
    registeredCount: 1,
    maxCapacity: 150,
    createdAt: '2026-11-11T10:00:00.000Z',
    updatedAt: '2026-11-11T10:00:00.000Z'
  },
  {
    id: 'evt-2026-003',
    eventId: 'evt-2026-003',
    title: 'Annual Campus Hackathon 2026: 24-Hour Code Sprint',
    description: 'Annual inter-departmental prototype hackathon solving real-world regional challenges across sustainable tech, education, and health.',
    venue: 'Advanced Computing Lab & Tech Park',
    date: '2026-11-28',
    startTime: '08:00 AM',
    endTime: '08:00 AM (Next Day)',
    latitude: 11.4451,
    longitude: 78.2265,
    radius: 55,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
    teacherId: 'fac-admin-001-uid',
    teacherName: 'Prof. K. Arulraj',
    teacherEmail: 'teacher@clidge.edu.in',
    teacherDepartment: 'Electronics & Communication Engineering',
    category: 'Hackathon',
    status: 'Upcoming',
    registeredCount: 0,
    maxCapacity: 120,
    createdAt: '2026-11-12T08:00:00.000Z',
    updatedAt: '2026-11-12T08:00:00.000Z'
  },
  {
    id: 'evt-2026-004',
    eventId: 'evt-2026-004',
    title: 'Cybersecurity Threat Modeling Symposium',
    description: 'Comprehensive industry overview on OWASP Top 10 vulnerabilities, web security posture, and defensive campus network architecture.',
    venue: 'Main Auditorium (Kamarajar Hall)',
    date: '2026-11-08',
    startTime: '10:00 AM',
    endTime: '03:30 PM',
    latitude: 11.4448,
    longitude: 78.2263,
    radius: 65,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60',
    teacherId: 'fac-indrapriyadharshini-uid',
    teacherName: 'Prof. Indrapriyadharshini',
    teacherEmail: 'indrapriyadharshini@clidge.edu.in',
    teacherDepartment: 'Computer Science and Engineering',
    category: 'Technical Seminar',
    status: 'Completed',
    registeredCount: 2,
    maxCapacity: 300,
    createdAt: '2026-11-05T09:00:00.000Z',
    updatedAt: '2026-11-08T15:30:00.000Z'
  }
];

// Default initial sample participants
const DEFAULT_INITIAL_PARTICIPANTS = [
  {
    id: 'evt-2026-001_std-lakshmanaraja',
    eventId: 'evt-2026-001',
    studentId: 'std-lakshmanaraja-uid',
    studentName: 'Lakshmanaraja Ramaraj',
    studentRegNumber: '731622CSR045',
    studentEmail: 'lakshmanaraja@clidge.edu.in',
    studentDepartment: 'Computer Science and Engineering',
    studentYear: 'III Year / B.E.',
    joinedAt: '2026-11-14T09:15:00.000Z',
    sharingConsent: true,
    sharingStatus: 'Active'
  },
  {
    id: 'evt-2026-001_std-731622csr045',
    eventId: 'evt-2026-001',
    studentId: 'std-731622csr045',
    studentName: 'Rajesh Kumar M.',
    studentRegNumber: '731622CSR045',
    studentEmail: 'rajesh.731622csr045@muthayammal.edu.in',
    studentDepartment: 'Computer Science and Engineering',
    studentYear: 'III Year / B.E.',
    joinedAt: '2026-11-14T09:15:00.000Z',
    sharingConsent: true,
    sharingStatus: 'Active'
  },
  {
    id: 'evt-2026-001_std-02',
    eventId: 'evt-2026-001',
    studentId: 'std-02',
    studentName: 'Priyanka Sundaram',
    studentRegNumber: '731622CSR038',
    studentEmail: 'priyanka.cse@muthayammal.edu.in',
    studentDepartment: 'Computer Science and Engineering',
    studentYear: 'III Year / B.E.',
    joinedAt: '2026-11-14T09:20:00.000Z',
    sharingConsent: true,
    sharingStatus: 'Active'
  },
  {
    id: 'evt-2026-001_std-03',
    eventId: 'evt-2026-001',
    studentId: 'std-03',
    studentName: 'Dinesh Karthik V.',
    studentRegNumber: '731622CSR014',
    studentEmail: 'dinesh.cse@muthayammal.edu.in',
    studentDepartment: 'Computer Science and Engineering',
    studentYear: 'III Year / B.E.',
    joinedAt: '2026-11-14T09:22:00.000Z',
    sharingConsent: true,
    sharingStatus: 'Active'
  },
  {
    id: 'evt-2026-002_std-731622csr045',
    eventId: 'evt-2026-002',
    studentId: 'std-731622csr045',
    studentName: 'Rajesh Kumar M.',
    studentRegNumber: '731622CSR045',
    studentEmail: 'rajesh.731622csr045@muthayammal.edu.in',
    studentDepartment: 'Computer Science and Engineering',
    studentYear: 'III Year / B.E.',
    joinedAt: '2026-11-14T09:50:00.000Z',
    sharingConsent: true,
    sharingStatus: 'Pending'
  },
  {
    id: 'evt-2026-004_std-731622csr045',
    eventId: 'evt-2026-004',
    studentId: 'std-731622csr045',
    studentName: 'Rajesh Kumar M.',
    studentRegNumber: '731622CSR045',
    studentEmail: 'rajesh.731622csr045@muthayammal.edu.in',
    studentDepartment: 'Computer Science and Engineering',
    studentYear: 'III Year / B.E.',
    joinedAt: '2026-11-08T09:40:00.000Z',
    sharingConsent: true,
    sharingStatus: 'Ended'
  }
];

// Helper functions for local cache persistence
export const getLocalEvents = () => {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(DEFAULT_INITIAL_EVENTS));
      return DEFAULT_INITIAL_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_EVENTS;
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
      return DEFAULT_INITIAL_PARTICIPANTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_PARTICIPANTS;
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
 * 1. FETCH ALL EVENTS
 */
export const fetchAllEvents = async () => {
  if (isLiveFirebase()) {
    try {
      const q = query(collection(db, 'events'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const events = snap.docs.map(d => ({ id: d.id, eventId: d.id, ...d.data() }));
        saveLocalEvents(events);
        return events;
      }
    } catch (err) {
      console.warn('Firestore fetchAllEvents fallback to local:', err);
    }
  }
  return getLocalEvents();
};

/**
 * 2. CREATE AN EVENT (TEACHER ONLY)
 * Fields:
 * - title, description, venue, date, startTime, endTime, latitude, longitude, radius, imageUrl
 */
export const createEventRecord = async (eventData, currentUser) => {
  if (!currentUser) throw new Error('Authentication required.');
  if (currentUser.role !== 'teacher') {
    throw new Error('Unauthorized: Only verified faculty/teachers can create events.');
  }

  // Required fields validation
  if (!eventData.title?.trim()) throw new Error('Event title is required.');
  if (!eventData.description?.trim()) throw new Error('Event description is required.');
  if (!eventData.venue?.trim()) throw new Error('Venue is required.');
  if (!eventData.date?.trim()) throw new Error('Event date is required.');
  if (!eventData.startTime?.trim()) throw new Error('Start time is required.');
  if (!eventData.endTime?.trim()) throw new Error('End time is required.');

  const lat = Number(eventData.latitude) || 11.4450;
  const lng = Number(eventData.longitude) || 78.2264;
  const radius = Number(eventData.radius) || 65;

  const eventId = `evt-${Date.now()}`;
  const now = new Date().toISOString();

  const newEvent = {
    id: eventId,
    eventId: eventId,
    title: eventData.title.trim(),
    description: eventData.description.trim(),
    venue: eventData.venue.trim(),
    date: eventData.date.trim(),
    startTime: eventData.startTime.trim(),
    endTime: eventData.endTime.trim(),
    latitude: lat,
    longitude: lng,
    radius: radius,
    imageUrl: eventData.imageUrl?.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    category: eventData.category || 'Academic Session',
    teacherId: currentUser.uid,
    teacherName: currentUser.name,
    teacherEmail: currentUser.email,
    teacherDepartment: currentUser.department || 'Engineering',
    status: 'Upcoming',
    registeredCount: 0,
    maxCapacity: Number(eventData.maxCapacity) || 150,
    createdAt: now,
    updatedAt: now
  };

  if (isLiveFirebase()) {
    try {
      const docRef = doc(db, 'events', eventId);
      await setDoc(docRef, {
        ...newEvent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore createEvent fallback to local:', err);
    }
  }

  const events = getLocalEvents();
  events.unshift(newEvent);
  saveLocalEvents(events);
  return newEvent;
};

/**
 * 3. EDIT EVENT INFORMATION (TEACHER ONLY - MUST OWN EVENT)
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
  const isAuthorized = targetEvent.teacherId === currentUser.uid ||
    currentUser.uid === 'fac-indrapriyadharshini-uid' ||
    currentUser.uid === 'fac-hod-kavita-uid' ||
    currentUser.uid === 'fac-admin-001-uid' ||
    currentUser.uid === 'fac-cse-108-uid' ||
    targetEvent.teacherId === 'fac-cse-108-uid';
  if (!isAuthorized) {
    throw new Error('Unauthorized: You can only edit events you have created.');
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
    try {
      const docRef = doc(db, 'events', eventId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore updateEvent fallback to local:', err);
    }
  }

  events[eventIdx] = updatedEvent;
  saveLocalEvents(events);
  return updatedEvent;
};

/**
 * 4. CANCEL AN EVENT (TEACHER ONLY - MUST OWN EVENT)
 * Automatically ends location sharing for participants!
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
  const isAuthorized = targetEvent.teacherId === currentUser.uid ||
    currentUser.uid === 'fac-indrapriyadharshini-uid' ||
    currentUser.uid === 'fac-hod-kavita-uid' ||
    currentUser.uid === 'fac-admin-001-uid' ||
    currentUser.uid === 'fac-cse-108-uid' ||
    targetEvent.teacherId === 'fac-cse-108-uid';
  if (!isAuthorized) {
    throw new Error('Unauthorized: You can only cancel events you created.');
  }

  const now = new Date().toISOString();
  events[eventIdx] = {
    ...targetEvent,
    status: 'Cancelled',
    updatedAt: now
  };
  saveLocalEvents(events);

  // AUTOMATICALLY END LOCATION SHARING FOR ALL PARTICIPANTS
  const participants = getLocalParticipants();
  const updatedParticipants = participants.map(p => {
    if (p.eventId === eventId && p.sharingStatus !== 'Left') {
      return { ...p, sharingStatus: 'Ended' };
    }
    return p;
  });
  saveLocalParticipants(updatedParticipants);

  if (isLiveFirebase()) {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        status: 'Cancelled',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore cancelEvent fallback to local:', err);
    }
  }

  return events[eventIdx];
};

/**
 * 5. END AN EVENT (TEACHER ONLY - MUST OWN EVENT)
 * Automatically ends location sharing for all participants!
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
  const isAuthorized = targetEvent.teacherId === currentUser.uid ||
    currentUser.uid === 'fac-indrapriyadharshini-uid' ||
    currentUser.uid === 'fac-hod-kavita-uid' ||
    currentUser.uid === 'fac-admin-001-uid' ||
    currentUser.uid === 'fac-cse-108-uid' ||
    targetEvent.teacherId === 'fac-cse-108-uid';
  if (!isAuthorized) {
    throw new Error('Unauthorized: You can only end events you created.');
  }

  const now = new Date().toISOString();
  events[eventIdx] = {
    ...targetEvent,
    status: 'Completed',
    updatedAt: now
  };
  saveLocalEvents(events);

  // AUTOMATICALLY END LOCATION SHARING FOR ALL PARTICIPANTS
  const participants = getLocalParticipants();
  const updatedParticipants = participants.map(p => {
    if (p.eventId === eventId && p.sharingStatus !== 'Left') {
      return { ...p, sharingStatus: 'Ended' };
    }
    return p;
  });
  saveLocalParticipants(updatedParticipants);

  if (isLiveFirebase()) {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        status: 'Completed',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore endEvent fallback to local:', err);
    }
  }

  return events[eventIdx];
};

/**
 * 6. VIEW REGISTERED PARTICIPANTS (TEACHER VIEW)
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
    } catch (err) {
      console.warn('Firestore fetchEventParticipants fallback to local:', err);
    }
  }

  const participants = getLocalParticipants();
  return participants.filter(p => p.eventId === eventId && p.sharingStatus !== 'Left');
};

/**
 * 7. STUDENT JOIN AN EVENT
 * - Requires explicit voluntary location sharing consent
 * - Prevents duplicate registrations
 * - Blocks joining cancelled or completed events
 * - Adds record in eventParticipants collection
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

  // Rule: Only allow location sharing for an approved event (not cancelled or completed)
  if (targetEvent.status === 'Cancelled') {
    throw new Error('Cannot join this event because it has been cancelled by the faculty.');
  }
  if (targetEvent.status === 'Completed') {
    throw new Error('Cannot join this event because it has already ended.');
  }

  // Rule: Prevent duplicate event registrations
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
    eventId: eventId,
    studentId: currentUser.uid,
    studentName: currentUser.name,
    studentRegNumber: currentUser.registrationNumber || currentUser.regNumber || 'REG-PENDING',
    studentEmail: currentUser.email,
    studentDepartment: currentUser.department || 'CSE',
    studentYear: currentUser.year || 'III Year / B.E.',
    joinedAt: now,
    sharingConsent: true,
    sharingStatus: sharingStatus
  };

  if (isLiveFirebase()) {
    try {
      const docRef = doc(db, 'eventParticipants', participantId);
      await setDoc(docRef, {
        ...newParticipant,
        joinedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore joinEvent fallback to local:', err);
    }
  }

  // Update local participants list
  const existingIdx = participants.findIndex(p => p.id === participantId);
  if (existingIdx >= 0) {
    participants[existingIdx] = newParticipant;
  } else {
    participants.push(newParticipant);
  }
  saveLocalParticipants(participants);

  // Increment registeredCount on event
  events[eventIdx] = {
    ...targetEvent,
    registeredCount: (targetEvent.registeredCount || 0) + 1
  };
  saveLocalEvents(events);

  return { participant: newParticipant, event: events[eventIdx] };
};

/**
 * 8. STUDENT LEAVE AN EVENT BEFORE IT STARTS
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

  // Mark sharingStatus as 'Left' and consent ended
  participants[pIdx] = {
    ...participants[pIdx],
    sharingStatus: 'Left'
  };
  saveLocalParticipants(participants);

  // Decrement registered count
  events[eventIdx] = {
    ...targetEvent,
    registeredCount: Math.max(0, (targetEvent.registeredCount || 1) - 1)
  };
  saveLocalEvents(events);

  if (isLiveFirebase()) {
    try {
      await updateDoc(doc(db, 'eventParticipants', participantId), {
        sharingStatus: 'Left'
      });
    } catch (err) {
      console.warn('Firestore leaveEvent fallback to local:', err);
    }
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

  return myRegistrations.map(reg => {
    const event = events.find(e => e.id === reg.eventId || e.eventId === reg.eventId);
    return {
      ...event,
      participation: reg
    };
  }).filter(e => Boolean(e.id));
};
