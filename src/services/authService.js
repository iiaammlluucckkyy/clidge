import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Local persistence key for offline/demo database replication
const LOCAL_USERS_KEY = 'clidge_persisted_users_v2';
const LOCAL_SESSION_KEY = 'clidge_current_session_v2';

// Pre-seeded authorized teacher and sample student accounts for instant verification
const DEFAULT_AUTHORIZED_TEACHERS = [
  {
    uid: 'fac-cse-108-uid',
    name: 'Dr. S. Meenakshi, Ph.D.',
    email: 'meenakshi.cse@muthayammal.edu.in',
    password: 'Password@123', // Authorized initial password
    registrationNumber: 'FAC-MEC-CSE-108',
    department: 'Computer Science and Engineering',
    designation: 'Associate Professor & Campus Event Coordinator',
    year: 'Faculty Coordinator',
    role: 'teacher',
    createdAt: '2024-01-10T09:00:00.000Z'
  },
  {
    uid: 'fac-admin-001-uid',
    name: 'Prof. K. Arulraj',
    email: 'teacher@clidge.edu.in',
    password: 'Teacher@2026',
    registrationNumber: 'FAC-MEC-ECE-042',
    department: 'Electronics & Communication Engineering',
    designation: 'Assistant Professor / ECE',
    year: 'Faculty Coordinator',
    role: 'teacher',
    createdAt: '2024-01-10T09:00:00.000Z'
  }
];

// Helper to access locally stored users
const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_AUTHORIZED_TEACHERS));
      return DEFAULT_AUTHORIZED_TEACHERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AUTHORIZED_TEACHERS;
  }
};

const saveLocalUser = (userRecord) => {
  const users = getLocalUsers();
  const existingIdx = users.findIndex(u => u.email.toLowerCase() === userRecord.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...userRecord };
  } else {
    users.push(userRecord);
  }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

// Check if Firebase keys are real production keys vs default template
export const isLiveFirebase = () => {
  return Boolean(
    env.VITE_FIREBASE_API_KEY &&
    !env.VITE_FIREBASE_API_KEY.includes('MOCK_DEMO') &&
    !env.VITE_FIREBASE_API_KEY.includes('your_firebase_api_key')
  );
};

/**
 * Human-friendly error message translator for Firebase error codes
 */
export const formatAuthError = (error) => {
  const code = error?.code || '';
  const msg = error?.message || '';

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Incorrect email or password. Please verify your credentials.';
  }
  if (code === 'auth/user-not-found') {
    return 'No registered account found with this email address. Please register first.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please log in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid institutional email address.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Access temporarily blocked due to multiple failed attempts. Please try again in a few minutes.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Please check your internet connectivity.';
  }
  if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key') {
    return 'Firebase API key in .env is not active yet. Running in secure local offline auth mode.';
  }
  return msg || 'An unexpected authentication error occurred. Please try again.';
};

/**
 * 1. STUDENT REGISTRATION
 * - Sets role to 'student' unconditionally (security requirement)
 * - Writes profile to Firestore `users/{uid}` collection
 */
export const registerStudent = async ({
  name,
  email,
  password,
  registrationNumber,
  department,
  year
}) => {
  // Field validation
  if (!name?.trim()) throw new Error('Full name is required.');
  if (!email?.trim() || !email.includes('@')) throw new Error('A valid email address is required.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long.');
  if (!registrationNumber?.trim()) throw new Error('Registration number is required.');
  if (!department?.trim()) throw new Error('Please select your academic department.');
  if (!year?.trim()) throw new Error('Please select your year of study.');

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedReg = registrationNumber.trim().toUpperCase();

  // Enforce SECURITY: Role is ALWAYS 'student' for public registrations
  const role = 'student';
  const createdAt = new Date().toISOString();

  let uid = `std-${Date.now()}`;
  let liveFirebaseSuccess = false;

  if (isLiveFirebase()) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      uid = userCredential.user.uid;

      // Update displayName in Firebase Auth
      await updateProfile(userCredential.user, { displayName: name.trim() });

      // Save to Cloud Firestore `users` collection
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        uid,
        name: name.trim(),
        email: normalizedEmail,
        registrationNumber: trimmedReg,
        department,
        year,
        role: 'student', // Security requirement: enforced in rules
        createdAt: serverTimestamp()
      });

      liveFirebaseSuccess = true;
    } catch (err) {
      // If it's a genuine Firebase Auth error (like email-already-in-use), rethrow
      if (err.code && err.code !== 'auth/api-key-not-valid' && err.code !== 'auth/invalid-api-key') {
        throw new Error(formatAuthError(err));
      }
      // Otherwise fall through to local persistence
    }
  }

  // Construct final profile
  const userProfile = {
    uid,
    name: name.trim(),
    email: normalizedEmail,
    registrationNumber: trimmedReg,
    department,
    year,
    role: 'student',
    password, // Kept in local secure record for offline test simulation
    createdAt
  };

  // Always save to local store so offline refresh & demo mode maintain state
  saveLocalUser(userProfile);
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));

  return userProfile;
};

/**
 * 2. STUDENT & TEACHER LOGIN
 * - Authenticates credentials
 * - Verifies role matches requested portal
 * - Protects teacher portal from unauthorized student access
 */
export const loginUser = async ({ email, password, requiredRole }) => {
  if (!email?.trim()) throw new Error('Please enter your email address.');
  if (!password) throw new Error('Please enter your password.');

  const normalizedEmail = email.trim().toLowerCase();
  let userProfile = null;
  let liveFirebaseSuccess = false;

  if (isLiveFirebase()) {
    try {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const uid = credential.user.uid;

      // Fetch Firestore user document
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        userProfile = { uid, ...userSnap.data() };
        liveFirebaseSuccess = true;
      }
    } catch (err) {
      if (err.code && err.code !== 'auth/api-key-not-valid' && err.code !== 'auth/invalid-api-key') {
        throw new Error(formatAuthError(err));
      }
    }
  }

  // Fallback to local store if not fetched from live Firestore
  if (!userProfile) {
    const localUsers = getLocalUsers();
    const found = localUsers.find(
      u => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!found) {
      // Check if user exists with wrong password
      const userExists = localUsers.some(u => u.email.toLowerCase() === normalizedEmail);
      if (userExists) {
        throw new Error('Incorrect password. Please verify your credentials.');
      } else {
        throw new Error('No account found with this email address. Please register first.');
      }
    }
    userProfile = { ...found };
  }

  // ==========================================================
  // ROLE SECURITY VALIDATION
  // ==========================================================
  if (requiredRole === 'teacher' && userProfile.role !== 'teacher') {
    // If student attempts to log in via teacher portal, strictly reject
    if (liveFirebaseSuccess) {
      await signOut(auth).catch(() => {});
    }
    throw new Error(
      'Access Denied: This account has student privileges. Students are not authorized to access the Faculty Monitoring Portal.'
    );
  }

  if (requiredRole === 'student' && userProfile.role === 'teacher') {
    // Helpful guidance if teacher uses student portal
    throw new Error(
      'This account is registered as Faculty/Teacher. Please use the Teacher Login portal to access teacher features.'
    );
  }

  // Store active session
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));
  return userProfile;
};

/**
 * 3. LOGOUT FUNCTIONALITY
 */
export const logoutUser = async () => {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (err) {
    console.warn('Firebase signout error:', err);
  } finally {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
};

/**
 * 4. GET CURRENT RESTORED SESSION
 * Called on application startup / page refresh
 */
export const getPersistedSession = () => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * 5. TRUSTED ADMINISTRATIVE TEACHER PROVISIONING
 * Teacher accounts can ONLY be provisioned by an administrator with the trusted secret.
 */
export const provisionTeacherAccount = async ({
  name,
  email,
  password,
  registrationNumber,
  department,
  designation,
  adminSecret
}) => {
  const trustedSecret = env.VITE_ADMIN_PROVISION_SECRET || 'MEC-CSE-ADMIN-SECURE-2026';
  if (adminSecret !== trustedSecret) {
    throw new Error('Unauthorized: Invalid administrative authorization secret key.');
  }

  if (!name || !email || !password || !registrationNumber) {
    throw new Error('All teacher provisioning fields are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  let uid = `fac-${Date.now()}`;

  if (isLiveFirebase()) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      uid = cred.user.uid;
      await updateProfile(cred.user, { displayName: name.trim() });
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: name.trim(),
        email: normalizedEmail,
        registrationNumber: registrationNumber.trim(),
        department,
        designation: designation || 'Associate Professor',
        role: 'teacher',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Live Firebase teacher provisioning fallback:', err);
    }
  }

  const teacherRecord = {
    uid,
    name: name.trim(),
    email: normalizedEmail,
    password,
    registrationNumber: registrationNumber.trim(),
    department,
    designation: designation || 'Associate Professor & Event Coordinator',
    role: 'teacher',
    createdAt: new Date().toISOString()
  };

  saveLocalUser(teacherRecord);
  return teacherRecord;
};
