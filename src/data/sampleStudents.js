/**
 * Sample Students & Roster Data for CLIDGE UI Demonstration
 * Realistic collegiate student records with GNSS coordinates and geofence tracking statuses.
 */

export const SAMPLE_STUDENT_PROFILE = {
  id: 'std-731622csr045',
  name: 'Rajesh Kumar M.',
  email: 'rajesh.731622csr045@muthayammal.edu.in',
  regNumber: '731622CSR045',
  role: 'Student',
  department: 'Computer Science and Engineering',
  year: 'III Year / B.E.',
  section: 'CSE - Section B',
  rollNumber: '22CSB45',
  academicYear: '2024 - 2026',
  avatarUrl: null, // Will use initials
  phone: '+91 98421 78910',
  currentEventId: 'evt-2026-001',
  currentEventName: 'National Level Workshop on Generative AI & Autonomous Agents',
  currentZone: 'Main Auditorium (Kamarajar Hall)',
  zoneCode: 'ZONE-A1',
  geofenceStatus: 'Inside Venue', // 'Inside Venue' | 'Outside Bounds' | 'Offline'
  gpsSharingEnabled: true,
  lastKnownCoordinates: { lat: 11.49824, lng: 78.16345 },
  accuracyMeters: 4.2,
  batteryLevel: 84,
  lastPingTime: 'Just now (12s ago)',
  attendanceStats: {
    overallPercentage: 94.2,
    eventsAttended: 16,
    totalRegistered: 17,
    hoursMonitored: 78.5,
    upcomingCount: 2,
    categoryBreakdown: [
      { name: 'Technical Workshops', attended: 8, total: 8, pct: 100 },
      { name: 'Guest Lectures', attended: 4, total: 5, pct: 80 },
      { name: 'Symposiums & Hackathons', attended: 3, total: 3, pct: 100 },
      { name: 'Campus Seminars', attended: 1, total: 1, pct: 100 }
    ]
  }
};

export const SAMPLE_TEACHER_PROFILE = {
  id: 'fac-cse-108',
  name: 'Dr. S. Meenakshi, Ph.D.',
  email: 'meenakshi.cse@muthayammal.edu.in',
  regNumber: 'FAC-MEC-CSE-108',
  role: 'Teacher / Faculty Coordinator',
  department: 'Computer Science and Engineering',
  designation: 'Associate Professor & Campus Event Coordinator',
  cabin: 'CS Academic Block - Room 214',
  phone: '+91 94432 55678',
  supervisedEventsCount: 18,
  activeEventsCount: 2,
  totalStudentsMonitored: 142
};

export const MONITORED_STUDENTS = [
  {
    id: 'std-01',
    name: 'Rajesh Kumar M.',
    regNumber: '731622CSR045',
    department: 'CSE - III Year',
    eventName: 'National Level Workshop on Generative AI',
    zone: 'Main Auditorium (Zone A1)',
    status: 'Inside Venue',
    locationQuality: 'Live GPS',
    lastPing: '12s ago',
    coordinates: { lat: 11.49824, lng: 78.16345, xPercent: 48, yPercent: 46 },
    battery: 84,
    sharing: true
  },
  {
    id: 'std-02',
    name: 'Priyanka Sundaram',
    regNumber: '731622CSR038',
    department: 'CSE - III Year',
    eventName: 'National Level Workshop on Generative AI',
    zone: 'Main Auditorium (Zone A1)',
    status: 'Inside Venue',
    locationQuality: 'Live GPS',
    lastPing: '24s ago',
    coordinates: { lat: 11.49821, lng: 78.16348, xPercent: 52, yPercent: 49 },
    battery: 76,
    sharing: true
  },
  {
    id: 'std-03',
    name: 'Dinesh Karthik V.',
    regNumber: '731622CSR014',
    department: 'CSE - III Year',
    eventName: 'National Level Workshop on Generative AI',
    zone: 'Campus Cafeteria (Out of Bounds)',
    status: 'Outside Bounds',
    locationQuality: 'Alert: Boundary Breached',
    lastPing: '1m ago',
    coordinates: { lat: 11.49610, lng: 78.16120, xPercent: 22, yPercent: 78 },
    battery: 62,
    sharing: true
  },
  {
    id: 'std-04',
    name: 'Sneha Venkatesh',
    regNumber: '731622ECR052',
    department: 'ECE - III Year',
    eventName: 'Smart Campus IoT Systems Seminar',
    zone: 'CSE Seminar Hall (Zone C2)',
    status: 'Inside Venue',
    locationQuality: 'Live GPS',
    lastPing: '18s ago',
    coordinates: { lat: 11.49902, lng: 78.16418, xPercent: 68, yPercent: 28 },
    battery: 91,
    sharing: true
  },
  {
    id: 'std-05',
    name: 'Balaji Natarajan',
    regNumber: '731622CSR010',
    department: 'CSE - III Year',
    eventName: 'National Level Workshop on Generative AI',
    zone: 'Main Auditorium (Zone A1)',
    status: 'Inside Venue',
    locationQuality: 'Live GPS',
    lastPing: '35s ago',
    coordinates: { lat: 11.49818, lng: 78.16339, xPercent: 44, yPercent: 52 },
    battery: 68,
    sharing: true
  },
  {
    id: 'std-06',
    name: 'Kavitha Ramachandran',
    regNumber: '731622ITR024',
    department: 'IT - III Year',
    eventName: 'Smart Campus IoT Systems Seminar',
    zone: 'Last Known: Central Library Corridor',
    status: 'Outdated / Idle',
    locationQuality: 'Outdated (5m ago)',
    lastPing: '5m ago',
    coordinates: { lat: 11.49710, lng: 78.16390, xPercent: 58, yPercent: 65 },
    battery: 41,
    sharing: true
  },
  {
    id: 'std-07',
    name: 'Aravind Swaminathan',
    regNumber: '731622CSR006',
    department: 'CSE - III Year',
    eventName: 'National Level Workshop on Generative AI',
    zone: 'Main Auditorium (Zone A1)',
    status: 'Inside Venue',
    locationQuality: 'Live GPS',
    lastPing: '8s ago',
    coordinates: { lat: 11.49827, lng: 78.16350, xPercent: 50, yPercent: 42 },
    battery: 95,
    sharing: true
  },
  {
    id: 'std-08',
    name: 'Deepa Muthusamy',
    regNumber: '731622CSR012',
    department: 'CSE - III Year',
    eventName: 'National Level Workshop on Generative AI',
    zone: 'GPS Inactive / App Backgrounded',
    status: 'Offline',
    locationQuality: 'Signal Lost',
    lastPing: '14m ago',
    coordinates: { lat: 11.49815, lng: 78.16335, xPercent: 42, yPercent: 48 },
    battery: 18,
    sharing: false
  }
];

export const RECENT_ACTIVITIES = [
  {
    id: 'act-001',
    type: 'check_in',
    title: 'Verified Geofenced Check-In',
    description: 'Checked into "National Level Workshop on Generative AI" inside Main Auditorium.',
    timestamp: 'Today at 09:28 AM',
    status: 'success',
    badge: 'Inside Venue'
  },
  {
    id: 'act-002',
    type: 'gps_sync',
    title: 'Voluntary GPS Heartbeat Synced',
    description: 'GNSS coordinates submitted to common Flask endpoint /api/location/heartbeat (Accuracy: ±4.2m).',
    timestamp: 'Today at 11:42 AM',
    status: 'info',
    badge: 'Live Ping'
  },
  {
    id: 'act-003',
    type: 'qr_scan',
    title: 'Digital Token QR Validated',
    description: 'Signed cryptographic session token for Hall 302 access.',
    timestamp: 'Yesterday at 02:15 PM',
    status: 'success',
    badge: 'Verified'
  },
  {
    id: 'act-004',
    type: 'event_join',
    title: 'Registered for Annual Campus Hackathon 2026',
    description: 'Slot confirmed for 24-Hour Code Sprint (Tech Park Lab 4).',
    timestamp: '2 days ago',
    status: 'info',
    badge: 'Upcoming'
  },
  {
    id: 'act-005',
    type: 'attendance_record',
    title: 'Attendance Certificate Issued',
    description: '100% session presence logged for "Cybersecurity Threat Modeling".',
    timestamp: 'Nov 08, 2026',
    status: 'success',
    badge: 'Completed'
  }
];
