/**
 * CLIDGE Firebase & Firestore Architecture Guide
 * 
 * To connect your live Firebase project:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Enable Firebase Authentication (Email/Password & Google)
 * 3. Enable Cloud Firestore
 * 4. Add the keys in your .env file
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSy_MOCK_DEMO_KEY_MUTHAYAMMAL",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "clidge-campus.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "clidge-campus",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "clidge-campus.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "731622000000",
  appId: env.VITE_FIREBASE_APP_ID || "1:731622000000:web:clidgeabc123"
};

/**
 * Cloud Firestore Collection Schema Blueprint:
 * 
 * 1. collections/users/{userId}
 *    - uid: string
 *    - name: string
 *    - email: string
 *    - registrationNumber: string (e.g. 731622CSR045)
 *    - department: string
 *    - year: string
 *    - role: "student" | "teacher"
 *    - createdAt: timestamp / string
 * 
 * 2. collections/events/{eventId}
 *    - title: string
 *    - status: "Ongoing" | "Upcoming" | "Completed"
 *    - venue: string
 *    - zoneId: string
 *    - geofenceRadius: number (in meters)
 *    - centerCoords: geopoint { lat, lng }
 *    - startTime: timestamp
 *    - endTime: timestamp
 * 
 * 3. collections/events/{eventId}/live_locations/{studentId}
 *    - studentName: string
 *    - regNumber: string
 *    - latitude: number
 *    - longitude: number
 *    - accuracy: number
 *    - geofenceStatus: "Inside Venue" | "Outside Bounds" | "Outdated"
 *    - lastPingTime: serverTimestamp()
 *    - batteryLevel: number
 * 
 * 4. collections/attendance_records/{recordId}
 *    - eventId: string
 *    - studentId: string
 *    - checkInTime: timestamp
 *    - verifiedMethod: "GEOFENCE_GPS" | "QR_CODE" | "MANUAL_FACULTY"
 */

export const isFirebaseConfigured = () => {
  const key = env.VITE_FIREBASE_API_KEY || '';
  if (!key) return false;
  const upper = key.toUpperCase();
  return Boolean(
    key &&
    !upper.includes('DEMO') &&
    !upper.includes('MOCK') &&
    !upper.includes('PLACEHOLDER') &&
    !upper.includes('YOUR') &&
    !upper.includes('EXAMPLE') &&
    !upper.includes('CLIDGE') &&
    key.length >= 35
  );
};
