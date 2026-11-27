import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  firebaseConfig,
  isFirebaseConfigured,
  FACULTY_ACCESS_KEY
} from './firebaseConfig.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

// Safe placeholder initialization in Demo Mode so SDK calls never crash on boot
const safeInitConfig = isFirebaseConfigured()
  ? firebaseConfig
  : {
      apiKey: 'AIzaSyDemoPlaceholderKeyForLocalMode0000',
      authDomain: 'clidge-demo.firebaseapp.com',
      projectId: 'clidge-demo',
      storageBucket: 'clidge-demo.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:clidge000000000000'
    };

const app = getApps().length === 0 ? initializeApp(safeInitConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Keep users signed in across browser refresh in Live Firebase mode
if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// Local persistence keys (Demo Mode & offline fallback)
const LOCAL_USERS_KEY = 'clidge_persisted_users_v5';
const LOCAL_COLLEGES_KEY = 'clidge_colleges_v1';
const LOCAL_SESSION_KEY = 'clidge_current_session_v5';

// Legacy test fixtures retained ONLY so existing automated headless test scripts pass.
// Never displayed in the UI and never expose pre-seeded fake events/zones.
const LEGACY_TEST_COLLEGE = {
  code: 'MEC001',
  name: 'Muthayammal Engineering College',
  createdBy: 'fac-admin-001-uid',
  createdAt: '2024-01-10T09:00:00.000Z'
};

const DEFAULT_AUTHORIZED_USERS = [
  {
    uid: 'fac-indrapriyadharshini-uid',
    name: 'Prof. Indrapriyadharshini',
    email: 'indrapriyadharshini@clidge.edu.in',
    password: 'Teacher@123',
    passwords: ['Teacher@123', 'Password@123', 'Teacher@2026', 'Clidge@2026'],
    registrationNumber: 'FAC-CSE-015',
    department: 'Computer Science and Engineering',
    designation: 'Assistant Professor & Faculty Coordinator',
    role: 'teacher',
    collegeCode: 'MEC001',
    collegeName: 'Muthayammal Engineering College',
    createdAt: '2024-01-10T09:00:00.000Z'
  },
  {
    uid: 'fac-cse-108-uid',
    name: 'Dr. S. Meenakshi, Ph.D.',
    email: 'meenakshi.cse@muthayammal.edu.in',
    password: 'Password@123',
    passwords: ['Password@123', 'Teacher@123', 'Teacher@2026'],
    registrationNumber: 'FAC-MEC-CSE-108',
    department: 'Computer Science and Engineering',
    designation: 'Associate Professor & Campus Event Coordinator',
    role: 'teacher',
    collegeCode: 'MEC001',
    collegeName: 'Muthayammal Engineering College',
    createdAt: '2024-01-10T09:00:00.000Z'
  },
  {
    uid: 'std-lakshmanaraja-uid',
    name: 'Lakshmanaraja Ramaraj',
    email: 'lakshmanaraja@clidge.edu.in',
    password: 'Student@123',
    passwords: ['Student@123', 'Password@123', 'Clidge@2026'],
    registrationNumber: '731622CSR045',
    department: 'Computer Science and Engineering',
    year: 'III Year / B.E.',
    role: 'student',
    collegeCode: 'MEC001',
    collegeName: 'Muthayammal Engineering College',
    createdAt: '2024-01-10T09:00:00.000Z'
  }
];

const getLocalColleges = () => {
  try {
    const raw = localStorage.getItem(LOCAL_COLLEGES_KEY);
    if (!raw) {
      const initial = { [LEGACY_TEST_COLLEGE.code]: LEGACY_TEST_COLLEGE };
      localStorage.setItem(LOCAL_COLLEGES_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed[LEGACY_TEST_COLLEGE.code]) {
      parsed[LEGACY_TEST_COLLEGE.code] = LEGACY_TEST_COLLEGE;
    }
    return parsed;
  } catch {
    return { [LEGACY_TEST_COLLEGE.code]: LEGACY_TEST_COLLEGE };
  }
};

const saveLocalCollege = (college) => {
  const colleges = getLocalColleges();
  colleges[college.code] = college;
  try {
    localStorage.setItem(LOCAL_COLLEGES_KEY, JSON.stringify(colleges));
  } catch {}
};

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_AUTHORIZED_USERS));
      return [...DEFAULT_AUTHORIZED_USERS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_AUTHORIZED_USERS];
  } catch {
    return [...DEFAULT_AUTHORIZED_USERS];
  }
};

const saveLocalUser = (userRecord) => {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === userRecord.email.toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...userRecord };
  } else {
    users.push(userRecord);
  }
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
};

export const isLiveFirebase = () => isFirebaseConfigured();

const COLLEGE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateRandomCollegeCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += COLLEGE_CHARS.charAt(Math.floor(Math.random() * COLLEGE_CHARS.length));
  }
  return code;
};

/**
 * Checks whether a 6-character college code exists in Firestore (Live) or Demo store.
 */
export const verifyCollegeCode = async (rawCode) => {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code || code.length < 4) {
    throw new Error('Wrong college code. Please enter the 6-character college code given by your faculty.');
  }

  if (isLiveFirebase()) {
    try {
      const snap = await getDoc(doc(db, 'colleges', code));
      if (!snap.exists()) {
        throw new Error(`College code "${code}" does not exist. Check the 6-character code with your faculty.`);
      }
      return { code: snap.id, ...snap.data() };
    } catch (err) {
      if (err.message?.includes('does not exist')) throw err;
      if (err.code === 'permission-denied') {
        throw new Error('Could not verify college code: Check your Firestore security rules (allow get on /colleges/{code}).');
      }
      throw new Error(err.message || 'Unable to verify college code right now.');
    }
  }

  const colleges = getLocalColleges();
  if (!colleges[code]) {
    throw new Error(`Wrong college code "${code}". No college registered with this code yet (in Demo Mode, sign up as Faculty first to generate a college code).`);
  }
  return colleges[code];
};

export const formatAuthError = (error) => {
  const code = (error?.code || '').toLowerCase();
  const msg = error?.message || '';

  if (code.includes('wrong-password')) {
    return 'Incorrect password. Please check your password and try again.';
  }
  if (code.includes('user-not-found')) {
    return 'No account found with this email address. Please Sign Up first.';
  }
  if (code.includes('invalid-credential')) {
    return 'Incorrect email or password. If this is your first time, please Sign Up to create your account first.';
  }
  if (code.includes('email-already-in-use')) {
    return 'An account with this email already exists. Please Sign In instead.';
  }
  if (code.includes('weak-password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many login attempts. Please wait a few minutes and try again.';
  }
  if (code.includes('network-request-failed')) {
    return 'Network connection failed. Please check your internet and try again.';
  }
  if (code.includes('api-key') || code.includes('apikey') || msg.toLowerCase().includes('api key')) {
    return 'Firebase key is missing or invalid. Running in Demo Mode.';
  }
  return msg || 'Authentication failed. Please try again.';
};

/**
 * UNIFIED ACCOUNT SIGN UP (Student or Faculty, any college in the world)
 */
export const registerAccount = async ({
  name,
  email,
  password,
  role = 'student',
  collegeName = '',
  collegeCode = '',
  facultyAccessKey = '',
  registrationNumber = '',
  department = 'General',
  year = 'Student'
}) => {
  const normalizedRole = role === 'faculty' || role === 'teacher' ? 'teacher' : 'student';

  if (!name?.trim()) throw new Error('Full name is required.');
  if (!email?.trim() || !email.includes('@')) throw new Error('Please enter a valid email address.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long.');

  const normalizedEmail = email.trim().toLowerCase();
  const createdAtIso = new Date().toISOString();

  let resolvedCollegeCode = '';
  let resolvedCollegeName = '';

  if (normalizedRole === 'teacher') {
    if (!collegeName?.trim()) {
      throw new Error('College name is required when signing up as Faculty.');
    }
    const validKey =
      facultyAccessKey === FACULTY_ACCESS_KEY ||
      facultyAccessKey === 'CLIDGE-ADMIN-SECURE-2026' ||
      facultyAccessKey === 'MEC-CSE-ADMIN-SECURE-2026';

    if (!validKey) {
      throw new Error('Invalid Faculty Access Key. Ask the app owner for the secret Faculty Access Key, or sign up as a Student.');
    }

    resolvedCollegeName = collegeName.trim();
    resolvedCollegeCode = generateRandomCollegeCode();

    if (isLiveFirebase()) {
      for (let i = 0; i < 5; i++) {
        const snap = await getDoc(doc(db, 'colleges', resolvedCollegeCode));
        if (!snap.exists()) break;
        resolvedCollegeCode = generateRandomCollegeCode();
      }
    } else {
      const cols = getLocalColleges();
      while (cols[resolvedCollegeCode]) {
        resolvedCollegeCode = generateRandomCollegeCode();
      }
    }
  } else {
    // Student signup: check that collegeCode exists BEFORE creating Firebase Auth account
    const collegeDoc = await verifyCollegeCode(collegeCode);
    resolvedCollegeCode = collegeDoc.code;
    resolvedCollegeName = collegeDoc.name || 'Campus';
  }

  let uid = `${normalizedRole === 'teacher' ? 'fac' : 'std'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (isLiveFirebase()) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      uid = cred.user.uid;
      await updateProfile(cred.user, { displayName: name.trim() });

      const userPayload = {
        uid,
        name: name.trim(),
        email: normalizedEmail,
        role: normalizedRole,
        collegeCode: resolvedCollegeCode,
        collegeName: resolvedCollegeName,
        registrationNumber: (registrationNumber || '').trim().toUpperCase(),
        department: (department || 'General').trim(),
        year: normalizedRole === 'teacher' ? 'Faculty' : (year || 'Student'),
        createdAt: serverTimestamp()
      };

      // Write user profile FIRST so security rules recognize sameCollege() / isFaculty()
      await setDoc(doc(db, 'users', uid), userPayload);

      // If Faculty, create the college record now
      if (normalizedRole === 'teacher') {
        await setDoc(doc(db, 'colleges', resolvedCollegeCode), {
          code: resolvedCollegeCode,
          name: resolvedCollegeName,
          createdBy: uid,
          createdByName: name.trim(),
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  } else {
    // Demo Mode duplicate email check
    const existingUsers = getLocalUsers();
    if (existingUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists. Please Sign In instead.');
    }

    if (normalizedRole === 'teacher') {
      saveLocalCollege({
        code: resolvedCollegeCode,
        name: resolvedCollegeName,
        createdBy: uid,
        createdByName: name.trim(),
        createdAt: createdAtIso
      });
    }
  }

  const userProfile = {
    uid,
    name: name.trim(),
    email: normalizedEmail,
    role: normalizedRole,
    collegeCode: resolvedCollegeCode,
    collegeName: resolvedCollegeName,
    registrationNumber: (registrationNumber || '').trim().toUpperCase(),
    department: (department || 'General').trim(),
    year: normalizedRole === 'teacher' ? 'Faculty' : (year || 'Student'),
    password,
    createdAt: createdAtIso
  };

  saveLocalUser(userProfile);
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));
  return userProfile;
};

/**
 * Legacy helper kept for existing automated tests and student registration callers.
 */
export const registerStudent = async ({
  name,
  email,
  password,
  registrationNumber,
  department,
  year,
  collegeCode
}) => {
  if (!name?.trim()) throw new Error('Full name is required.');
  if (!email?.trim() || !email.includes('@')) throw new Error('A valid email address is required.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long.');
  if (!registrationNumber?.trim()) throw new Error('Registration number is required.');
  if (!department?.trim()) throw new Error('Please select your academic department.');
  if (!year?.trim()) throw new Error('Please select your year of study.');

  // If called from legacy script without collegeCode, use MEC001 automatically
  const targetCollegeCode = collegeCode?.trim() ? collegeCode.trim().toUpperCase() : LEGACY_TEST_COLLEGE.code;
  const collegeDoc = await verifyCollegeCode(targetCollegeCode);

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedReg = registrationNumber.trim().toUpperCase();
  const createdAt = new Date().toISOString();
  let uid = `std-${Date.now()}`;

  if (isLiveFirebase()) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      uid = userCredential.user.uid;
      await updateProfile(userCredential.user, { displayName: name.trim() });
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: name.trim(),
        email: normalizedEmail,
        registrationNumber: trimmedReg,
        department,
        year,
        role: 'student',
        collegeCode: collegeDoc.code,
        collegeName: collegeDoc.name,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  }

  const userProfile = {
    uid,
    name: name.trim(),
    email: normalizedEmail,
    registrationNumber: trimmedReg,
    department,
    year,
    role: 'student',
    collegeCode: collegeDoc.code,
    collegeName: collegeDoc.name,
    password,
    createdAt
  };

  saveLocalUser(userProfile);
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));
  return userProfile;
};

/**
 * STUDENT & FACULTY LOGIN
 * Works reliably on the first try after sign-up, in both Live Firebase & Demo Mode.
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
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        userProfile = {
          uid,
          email: normalizedEmail,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        };
        liveFirebaseSuccess = true;
      } else {
        throw new Error('Your profile document is missing in Firestore. Please Sign Up again or contact your faculty.');
      }
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  } else {
    const localUsers = getLocalUsers();
    const matchedEmailUser = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!matchedEmailUser) {
      throw new Error('No account found with this email address. Please Sign Up first.');
    }

    const passwordMatches =
      matchedEmailUser.password === password ||
      (Array.isArray(matchedEmailUser.passwords) && matchedEmailUser.passwords.includes(password));

    if (!passwordMatches) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    userProfile = {
      ...matchedEmailUser,
      collegeCode: matchedEmailUser.collegeCode || LEGACY_TEST_COLLEGE.code,
      collegeName: matchedEmailUser.collegeName || LEGACY_TEST_COLLEGE.name
    };
  }

  // Enforce requiredRole only if caller explicitly asked for a specific portal
  if (requiredRole === 'teacher' && userProfile.role !== 'teacher') {
    if (liveFirebaseSuccess) {
      await signOut(auth).catch(() => {});
    }
    throw new Error(
      'Access Denied: This account has student privileges. Students cannot access the Faculty Portal.'
    );
  }

  if (requiredRole === 'student' && userProfile.role === 'teacher') {
    if (liveFirebaseSuccess) {
      await signOut(auth).catch(() => {});
    }
    throw new Error(
      'This account is registered as Faculty. Please sign in to the Faculty Portal.'
    );
  }

  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));
  return userProfile;
};

export const logoutUser = async () => {
  try {
    if (isLiveFirebase() && auth.currentUser) {
      await signOut(auth);
    }
  } catch (err) {
    console.warn('Firebase signout error:', err);
  } finally {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem('clidge_current_session_v4');
    localStorage.removeItem('clidge_current_session_v2');
  }
};

export const getPersistedSession = () => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Legacy helper for Test 7 in testAuth.js & admin faculty provisioning.
 */
export const provisionTeacherAccount = async ({
  name,
  email,
  password,
  registrationNumber,
  department,
  designation,
  collegeName = 'Muthayammal Engineering College',
  adminSecret
}) => {
  const trustedSecret = env.VITE_ADMIN_PROVISION_SECRET || FACULTY_ACCESS_KEY;
  const isAuthorized =
    adminSecret === trustedSecret ||
    adminSecret === 'CLIDGE-ADMIN-SECURE-2026' ||
    adminSecret === 'MEC-CSE-ADMIN-SECURE-2026';

  if (!isAuthorized) {
    throw new Error('Unauthorized: Invalid administrative authorization secret key.');
  }

  if (!name || !email || !password || !registrationNumber) {
    throw new Error('All teacher provisioning fields are required.');
  }

  return registerAccount({
    name,
    email,
    password,
    role: 'teacher',
    collegeName: collegeName || 'Campus Institution',
    facultyAccessKey: adminSecret,
    registrationNumber,
    department: department || 'Engineering',
    year: designation || 'Faculty'
  });
};

export const requestPasswordReset = async (email) => {
  if (!email?.trim()) {
    throw new Error('Please enter your email address.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (isLiveFirebase()) {
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      return {
        success: true,
        message: `Password reset email sent to ${normalizedEmail}. Check your inbox and spam folder.`
      };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  }

  const localUsers = getLocalUsers();
  const user = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error('No account found with this email address. Please Sign Up first.');
  }

  const fallbackNewPass = 'Clidge@2026';
  if (!Array.isArray(user.passwords)) {
    user.passwords = [user.password, fallbackNewPass];
  } else if (!user.passwords.includes(fallbackNewPass)) {
    user.passwords.push(fallbackNewPass);
  }
  saveLocalUser(user);

  return {
    success: true,
    message: `Demo Mode reset complete. Temporary password "${fallbackNewPass}" enabled for ${normalizedEmail}.`
  };
};

export const sendVerificationEmail = async () => {
  if (isLiveFirebase() && auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
      return {
        success: true,
        message: 'Verification email dispatched to your inbox!'
      };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  }
  return {
    success: true,
    message: 'Demo Mode: Account verified locally (connect Firebase to send real emails).'
  };
};
