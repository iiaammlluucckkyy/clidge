/**
 * CLIDGE Firebase & Firestore Architecture Guide
 * 
 * To connect your live Firebase project:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Enable Firebase Authentication (Email/Password & Google)
 * 3. Enable Cloud Firestore
 * 4. Add the keys below to your .env file:
 *    VITE_FIREBASE_API_KEY=...
 *    VITE_FIREBASE_AUTH_DOMAIN=...
 *    VITE_FIREBASE_PROJECT_ID=...
 *    VITE_FIREBASE_STORAGE_BUCKET=...
 *    VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *    VITE_FIREBASE_APP_ID=...
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_MOCK_DEMO_KEY_MUTHAYAMMAL",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clidge-campus.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clidge-campus",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clidge-campus.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "731622000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:731622000000:web:clidgeabc123"
};

/**
 * Cloud Firestore Collection Schema Blueprint:
 * 
 * 1. collections/users/{userId}
 *    - name: string
 *    - regNumber: string (e.g. 731622CSR045)
 *    - role: "student" | "teacher" | "coordinator"
 *    - department: string
 *    - phone: string
 *    - createdAt: timestamp
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
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSy_MOCK_DEMO_KEY_MUTHAYAMMAL"
  );
};
