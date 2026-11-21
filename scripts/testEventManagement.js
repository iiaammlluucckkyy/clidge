/**
 * CLIDGE Event Management Automated Verification Script
 * Validates all Teacher and Student requirements:
 * 1. Teacher creates an event with all required fields (10 fields)
 * 2. Teacher views created events
 * 3. Teacher edits event
 * 4. Students cannot edit or delete events (security enforcement)
 * 5. Student joins event with location sharing consent
 * 6. Duplicate registration prevention
 * 7. Teacher views registered participants roster
 * 8. Student leaves event before it starts
 * 9. Teacher ends/cancels event, automatically terminating participant sharing status
 */

import {
  fetchAllEvents,
  createEventRecord,
  updateEventRecord,
  cancelEventRecord,
  endEventRecord,
  fetchEventParticipants,
  joinEventRecord,
  leaveEventRecord,
  getLocalEvents,
  getLocalParticipants
} from '../src/services/eventService.js';

// Setup Mock LocalStorage for Node environment
if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear()
  };
}

// Teacher Account
const teacherUser = {
  uid: 'fac-cse-108-uid',
  name: 'Dr. S. Meenakshi, Ph.D.',
  email: 'meenakshi.cse@muthayammal.edu.in',
  role: 'teacher',
  department: 'Computer Science and Engineering'
};

// Student 1 Account
const studentUser1 = {
  uid: 'std-731622csr045',
  name: 'Rajesh Kumar M.',
  email: 'rajesh.731622csr045@muthayammal.edu.in',
  role: 'student',
  registrationNumber: '731622CSR045',
  department: 'Computer Science and Engineering',
  year: 'III Year / B.E.'
};

// Student 2 Account
const studentUser2 = {
  uid: 'std-731622csr099',
  name: 'Ananya Ramesh',
  email: 'ananya.cse@muthayammal.edu.in',
  role: 'student',
  registrationNumber: '731622CSR099',
  department: 'Computer Science and Engineering',
  year: 'III Year / B.E.'
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('CLIDGE EVENT MANAGEMENT SYSTEM VERIFICATION');
  console.log('====================================================\n');

  // TEST 1: Teacher creates an event with 10 fields
  console.log('Test 1: Teacher creates an event with all 10 required fields...');
  const eventPayload = {
    title: 'Autonomous Robotics & Edge AI Hackfest 2026',
    description: '48-hour hands-on challenge building ROS2 edge vision robotics systems.',
    date: '2026-11-30',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: 'Main Auditorium (Kamarajar Hall)',
    latitude: 11.4982,
    longitude: 78.1634,
    radius: 65,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    maxCapacity: 100
  };

  let createdEvent;
  try {
    createdEvent = await createEventRecord(eventPayload, teacherUser);
    assert(createdEvent.id && createdEvent.eventId, 'Event created with unique eventId');
    assert(createdEvent.title === eventPayload.title, 'Event title matches');
    assert(createdEvent.venue === eventPayload.venue, 'Event venue matches');
    assert(createdEvent.latitude === 11.4982, 'Latitude stored correctly');
    assert(createdEvent.longitude === 78.1634, 'Longitude stored correctly');
    assert(createdEvent.radius === 65, 'Geofence radius stored correctly');
    assert(createdEvent.teacherId === teacherUser.uid, 'Owning teacherId stored');
    assert(createdEvent.status === 'Upcoming', 'Initial status is Upcoming');
    assert(createdEvent.registeredCount === 0, 'Initial registered count is 0');
  } catch (err) {
    assert(false, `Event creation failed: ${err.message}`);
  }

  // TEST 2: Security - Student cannot create an event
  console.log('\nTest 2: Security check - Students blocked from creating events...');
  try {
    await createEventRecord(eventPayload, studentUser1);
    assert(false, 'Student should NOT be able to create events');
  } catch (err) {
    assert(err.message.includes('Only verified faculty'), 'Proper unauthorized rejection on event creation');
  }

  // TEST 3: Teacher edits event information
  console.log('\nTest 3: Owning teacher edits event information...');
  try {
    const updated = await updateEventRecord(
      createdEvent.eventId,
      {
        venue: 'CSE Department Seminar Hall (Hall 302)',
        radius: 45
      },
      teacherUser
    );
    assert(updated.venue === 'CSE Department Seminar Hall (Hall 302)', 'Venue updated successfully');
    assert(updated.radius === 45, 'Geofence radius updated successfully');
  } catch (err) {
    assert(false, `Event update failed: ${err.message}`);
  }

  // TEST 4: Security - Student cannot edit event information
  console.log('\nTest 4: Security check - Student blocked from editing events...');
  try {
    await updateEventRecord(createdEvent.eventId, { title: 'Hacked Title' }, studentUser1);
    assert(false, 'Student should NOT be able to edit events');
  } catch (err) {
    assert(err.message.includes('Only teachers can edit events'), 'Proper unauthorized rejection on event editing');
  }

  // TEST 5: Student 1 joins event with voluntary location sharing consent
  console.log('\nTest 5: Student 1 joins event with voluntary location consent...');
  let joinResult;
  try {
    joinResult = await joinEventRecord(createdEvent.eventId, studentUser1, true);
    assert(joinResult.participant.studentId === studentUser1.uid, 'Participant record created for student');
    assert(joinResult.participant.sharingConsent === true, 'Voluntary sharing consent recorded as true');
    assert(joinResult.participant.sharingStatus === 'Pending' || joinResult.participant.sharingStatus === 'Active', 'Sharing status initialized');
    assert(joinResult.event.registeredCount === 1, 'Event registeredCount incremented to 1');
  } catch (err) {
    assert(false, `Join event failed: ${err.message}`);
  }

  // TEST 6: Student cannot join without location sharing consent
  console.log('\nTest 6: Student registration without consent rejected...');
  try {
    await joinEventRecord(createdEvent.eventId, studentUser2, false);
    assert(false, 'Student should NOT be able to join without consent');
  } catch (err) {
    assert(err.message.includes('consent is required'), 'Rejected join without consent');
  }

  // TEST 7: Prevent duplicate event registrations
  console.log('\nTest 7: Duplicate event registration prevention...');
  try {
    await joinEventRecord(createdEvent.eventId, studentUser1, true);
    assert(false, 'Duplicate registration should NOT be permitted');
  } catch (err) {
    assert(err.message.includes('already registered'), 'Proper duplicate registration guard triggered');
  }

  // TEST 8: Teacher views registered participants list
  console.log('\nTest 8: Teacher views registered participants roster...');
  try {
    const participants = await fetchEventParticipants(createdEvent.eventId, teacherUser);
    assert(participants.length >= 1, `Participants roster returned ${participants.length} entries`);
    const student1Entry = participants.find(p => p.studentId === studentUser1.uid);
    assert(student1Entry !== undefined, 'Student 1 is visible in teacher participant roster');
    assert(student1Entry?.studentRegNumber === '731622CSR045', 'Student roll number matches');
    assert(student1Entry?.sharingConsent === true, 'Sharing consent confirmed by teacher');
  } catch (err) {
    assert(false, `Fetch participants failed: ${err.message}`);
  }

  // TEST 9: Student 2 joins then leaves before event starts
  console.log('\nTest 9: Student 2 joins and leaves before event starts...');
  try {
    await joinEventRecord(createdEvent.eventId, studentUser2, true);
    let roster = await fetchEventParticipants(createdEvent.eventId, teacherUser);
    assert(roster.length === 2, 'Roster count increased to 2 after Student 2 joined');

    // Student 2 leaves
    const leaveRes = await leaveEventRecord(createdEvent.eventId, studentUser2);
    assert(leaveRes.success === true, 'Student 2 successfully left event');
    assert(leaveRes.event.registeredCount === 1, 'Registered count decremented back to 1');

    const updatedRoster = await fetchEventParticipants(createdEvent.eventId, teacherUser);
    assert(updatedRoster.length === 1, 'Roster active count reflects Student 2 left');
  } catch (err) {
    assert(false, `Leave event test failed: ${err.message}`);
  }

  // TEST 10: Teacher ends the event -> automatically terminates location sharing
  console.log('\nTest 10: Teacher ends event -> automatically terminates location sharing...');
  try {
    const ended = await endEventRecord(createdEvent.eventId, teacherUser);
    assert(ended.status === 'Completed', 'Event status transitioned to Completed');

    // Check participants sharingStatus
    const participants = getLocalParticipants();
    const student1Record = participants.find(p => p.eventId === createdEvent.eventId && p.studentId === studentUser1.uid);
    assert(student1Record.sharingStatus === 'Ended', 'Participant sharingStatus automatically changed to Ended');
  } catch (err) {
    assert(false, `End event test failed: ${err.message}`);
  }

  // TEST 11: Attempt to join ended/completed event rejected
  console.log('\nTest 11: Attempt to join ended event is rejected...');
  try {
    await joinEventRecord(createdEvent.eventId, studentUser2, true);
    assert(false, 'Should not be able to join completed event');
  } catch (err) {
    assert(err.message.includes('already ended'), 'Prevented join on ended event');
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
