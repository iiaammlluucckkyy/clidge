/**
 * Comprehensive verification for Clidge Multi-College Auth, Zones, Sessions, Events & Accuracy rules.
 */

import {
  registerAccount,
  loginUser,
  logoutUser,
  verifyCollegeCode
} from '../src/services/authService.js';
import {
  createEventRecord,
  deleteEventRecord,
  fetchAllEvents
} from '../src/services/eventService.js';
import {
  createCollegeZone,
  deleteCollegeZone,
  fetchCollegeZones
} from '../src/services/zoneService.js';
import {
  startLocationSession,
  endLocationSession,
  validateSessionForStudent,
  publishStudentSessionLocation
} from '../src/services/sessionService.js';
import { getCampusLandmark } from '../src/data/campusZones.js';

// Clean mock localStorage for isolated verification
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

let passed = 0;
let failed = 0;
const assert = (cond, msg) => {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
};

async function run() {
  console.log('🧪 Running Clidge Multi-College & Accurate Location Feature Suite...\n');

  // 1. Faculty Access Key rejection
  try {
    await registerAccount({
      name: 'Stranger User',
      email: 'stranger@example.com',
      password: 'Password@123',
      role: 'teacher',
      collegeName: 'Fake College',
      facultyAccessKey: 'WRONG-KEY'
    });
    assert(false, 'Stranger rejected without faculty access key');
  } catch (err) {
    assert(err.message.includes('Invalid Faculty Access Key'), 'Stranger rejected with clear Faculty Access Key error');
  }

  // 2. Faculty Signup creates College Code & starts empty (0 events, 0 zones)
  const facA = await registerAccount({
    name: 'Prof. Alice',
    email: 'alice@collegea.edu',
    password: 'Password@123',
    role: 'teacher',
    collegeName: 'Muthayammal Engineering College',
    facultyAccessKey: 'CLIDGE-ADMIN-SECURE-2026'
  });
  assert(facA.role === 'teacher', 'Faculty role assigned');
  assert(typeof facA.collegeCode === 'string' && facA.collegeCode.length === 6, `6-char college code generated: ${facA.collegeCode}`);

  const initialEventsA = await fetchAllEvents(facA.collegeCode);
  const initialZonesA = await fetchCollegeZones(facA.collegeCode);
  assert(initialEventsA.length === 0, 'New college starts with 0 events (no fake/sample events)');
  assert(initialZonesA.length === 0, 'New college starts with 0 zones (no fake/default zones)');

  // 3. Student wrong college code rejection
  try {
    await verifyCollegeCode('ZZZZ99');
    assert(false, 'Non-existent college code rejected');
  } catch (err) {
    assert(err.message.includes('Wrong college code') || err.message.includes('does not exist'), 'Invalid college code rejected clearly');
  }

  // 4. Student Signup with College Code A & Login on FIRST try
  const stdA = await registerAccount({
    name: 'Bob Student',
    email: 'bob@gmail.com',
    password: 'BobPassword@123',
    role: 'student',
    collegeCode: facA.collegeCode
  });
  assert(stdA.collegeCode === facA.collegeCode, 'Student bound to College A code');

  // Duplicate email rejection
  try {
    await registerAccount({
      name: 'Bob Clone',
      email: 'bob@gmail.com',
      password: 'BobPassword@123',
      role: 'student',
      collegeCode: facA.collegeCode
    });
    assert(false, 'Duplicate email rejected');
  } catch (err) {
    assert(err.message.includes('already exists'), 'Duplicate email shows clear error');
  }

  await logoutUser();
  const loggedInBob = await loginUser({ email: 'bob@gmail.com', password: 'BobPassword@123' });
  assert(loggedInBob.uid === stdA.uid, 'Login works on first try after sign-up (auto role detection)');

  // Wrong password error
  try {
    await loginUser({ email: 'bob@gmail.com', password: 'WrongPassword!' });
    assert(false, 'Wrong password rejected');
  } catch (err) {
    assert(err.message.includes('Incorrect password'), 'Wrong password shows clear error');
  }

  // Brand-new student sees 0 events
  const bobEvents = await fetchAllEvents(loggedInBob.collegeCode);
  assert(bobEvents.length === 0, 'Brand-new student sees ZERO events');

  // 5. College B isolation check
  const facB = await registerAccount({
    name: 'Prof. Carlos',
    email: 'carlos@collegeb.edu',
    password: 'Password@123',
    role: 'teacher',
    collegeName: 'Tokyo Tech Institute',
    facultyAccessKey: 'CLIDGE-ADMIN-SECURE-2026'
  });
  const stdB = await registerAccount({
    name: 'Kenji',
    email: 'kenji@gmail.com',
    password: 'Password@123',
    role: 'student',
    collegeCode: facB.collegeCode
  });

  // Faculty A creates event & zone & session
  const evtA = await createEventRecord(
    { title: 'AI Symposium', venue: 'Auditorium', date: '2026-12-01', startTime: '10:00 AM', description: 'Meetup' },
    facA
  );
  assert((await fetchAllEvents(facA.collegeCode)).length === 1, 'College A student sees 1 event');
  assert((await fetchAllEvents(stdB.collegeCode)).length === 0, 'College B student sees 0 events from College A (isolated)');

  // Faculty A deletes event
  await deleteEventRecord(evtA.id, facA);
  assert((await fetchAllEvents(facA.collegeCode)).length === 0, 'Faculty A event deleted cleanly');

  // Zone matching test (Hostel)
  const hostelZone = await createCollegeZone(
    { name: 'Boys Hostel', latitude: 11.4456, longitude: 78.2272, radius: 50 },
    facA
  );
  const insideCheck = getCampusLandmark(11.44565, 78.22722, [hostelZone]);
  const outsideCheck = getCampusLandmark(35.6762, 139.6503, [hostelZone]); // Tokyo!
  assert(insideCheck.isInside && insideCheck.landmark === 'Boys Hostel', 'Inside zone radius resolves exact Zone name');
  assert(!outsideCheck.isInside && outsideCheck.landmark === null, 'Outside radius (anywhere in world) triggers street address lookup instead of zone name');

  // Session isolation & end session
  const sessionA = await startLocationSession({ facultyUser: facA, title: 'Lab Morning' });
  const validJoin = await validateSessionForStudent(sessionA.sessionCode, stdA);
  assert(validJoin.sessionCode === sessionA.sessionCode, 'College A student joins College A session');

  try {
    await validateSessionForStudent(sessionA.sessionCode, stdB);
    assert(false, 'Cross-college student blocked from session');
  } catch (err) {
    assert(err.message.includes('another college'), 'Student cannot join another college session');
  }

  const published = await publishStudentSessionLocation(sessionA.sessionCode, stdA, {
    latitude: 11.44565,
    longitude: 78.22722,
    accuracy: 12,
    placeName: 'Boys Hostel',
    zoneName: 'Boys Hostel',
    isInsideZone: true
  });
  assert(published.isSharing === true && published.placeName === 'Boys Hostel', 'Student location saved accurately in session');

  await endLocationSession({ sessionCode: sessionA.sessionCode, facultyUser: facA });
  try {
    await validateSessionForStudent(sessionA.sessionCode, stdA);
    assert(false, 'Ended session blocked');
  } catch (err) {
    assert(err.message.includes('already ended'), 'Ended session blocks new sharing');
  }

  await deleteCollegeZone(hostelZone.id, facA);
  assert((await fetchCollegeZones(facA.collegeCode)).length === 0, 'Zone deleted cleanly');

  console.log(`\n========================================`);
  console.log(`🏁 MULTI-COLLEGE SUITE: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
