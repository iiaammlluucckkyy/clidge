/**
 * CLIDGE Campus Geofenced Zones
 * Coordinates based on campus layout with designated geofence radius in meters.
 * Note: Sample coordinates calibrated for collegiate demonstration.
 */
export const CAMPUS_ZONES = [
  {
    id: 'zone-auditorium',
    name: 'Main Auditorium (Kamarajar Hall)',
    building: 'Admin & Central Block',
    code: 'ZONE-A1',
    center: { lat: 11.4982, lng: 78.1634 },
    radiusMeters: 65,
    capacity: 650,
    type: 'Auditorium',
    color: '#06b6d4', // Cyan
  },
  {
    id: 'zone-cse-seminar',
    name: 'CSE Department Seminar Hall (Hall 302)',
    building: 'CS & IT Academic Block',
    code: 'ZONE-C2',
    center: { lat: 11.4990, lng: 78.1642 },
    radiusMeters: 45,
    capacity: 180,
    type: 'Seminar Hall',
    color: '#3b82f6', // Blue
  },
  {
    id: 'zone-tech-park',
    name: 'Advanced Computing Lab & Tech Park',
    building: 'Innovation Hub Block 4',
    code: 'ZONE-T3',
    center: { lat: 11.4975, lng: 78.1650 },
    radiusMeters: 55,
    capacity: 120,
    type: 'Laboratory',
    color: '#10b981', // Emerald
  },
  {
    id: 'zone-library',
    name: 'Central Library & Digital Reading Arena',
    building: 'Knowledge Center',
    code: 'ZONE-L1',
    center: { lat: 11.4968, lng: 78.1638 },
    radiusMeters: 50,
    capacity: 250,
    type: 'Library',
    color: '#f59e0b', // Amber
  },
  {
    id: 'zone-sports',
    name: 'Indoor Sports & Cultural Complex',
    building: 'Recreation Ground',
    code: 'ZONE-S1',
    center: { lat: 11.4955, lng: 78.1625 },
    radiusMeters: 80,
    capacity: 400,
    type: 'Sports Complex',
    color: '#8b5cf6', // Violet
  }
];

export const CAMPUS_METRICS = {
  institution: 'Smart Campus Institution',
  location: 'Engineering Campus Grounds',
  campusRadiusMeters: 850,
  gpsSamplingIntervalSeconds: 15,
  lastCalibration: 'Today, Live Demo Stream',
  geofencePrecision: 'High-Precision GNSS / WiFi Hybrid (± 4.2m)'
};
