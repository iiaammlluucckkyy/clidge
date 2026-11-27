/**
 * ============================================================================
 * CLIDGE FIREBASE & OWNER CONFIGURATION (ONE CLEARLY MARKED PLACE)
 * ============================================================================
 *
 * HOW TO ENABLE REAL-TIME MULTI-PHONE SYNC ACROSS THE WORLD:
 * 1. Go to https://console.firebase.google.com/ -> Create a project.
 * 2. Add a Web App (</>) and copy the 6 config values below.
 * 3. Paste them directly into PASTED_FIREBASE_CONFIG below (or set VITE_FIREBASE_*
 *    environment variables in your .env file / Vercel / Netlify dashboard).
 * 4. Enable Email/Password in Authentication -> Sign-in method.
 * 5. Create a Firestore Database and paste the rules from firestore.rules.
 *
 * IF THESE VALUES ARE EMPTY (""), CLIDGE RUNS AUTOMATICALLY IN DEMO MODE
 * WITH A WARNING BANNER (DATA STAYS ON THE CURRENT DEVICE ONLY).
 * ============================================================================
 */
export const PASTED_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBKAxB4fN8-RcB4iPkrglb56-3Vg3MNyvM",
  authDomain: "clidge-827ab.firebaseapp.com",
  projectId: "clidge-827ab",
  storageBucket: "clidge-827ab.firebasestorage.app",
  messagingSenderId: "193612065259",
  appId: "1:193612065259:web:7ef29c726d46b33ac091ae"
};

// Faculty Access Key (app owner can change this secret key so strangers cannot create faculty accounts)
export const OWNER_FACULTY_ACCESS_KEY = "CLIDGE-ADMIN-SECURE-2026";

// ============================================================================
// Internal config resolution (reads PASTED_FIREBASE_CONFIG first, then .env)
// ============================================================================
const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

const isValidApiKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  const upper = trimmed.toUpperCase();
  return (
    !upper.includes('DEMO') &&
    !upper.includes('MOCK') &&
    !upper.includes('PLACEHOLDER') &&
    !upper.includes('YOUR') &&
    !upper.includes('EXAMPLE') &&
    !upper.includes('CLIDGE') &&
    trimmed.length >= 30
  );
};

const pastedValid = isValidApiKey(PASTED_FIREBASE_CONFIG.apiKey);
const envValid = isValidApiKey(env.VITE_FIREBASE_API_KEY);

export const firebaseConfig = pastedValid
  ? { ...PASTED_FIREBASE_CONFIG }
  : {
      apiKey: envValid ? env.VITE_FIREBASE_API_KEY : "",
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: env.VITE_FIREBASE_APP_ID || ""
    };

export const FACULTY_ACCESS_KEY =
  env.VITE_FACULTY_ACCESS_KEY ||
  env.VITE_ADMIN_PROVISION_SECRET ||
  OWNER_FACULTY_ACCESS_KEY;

export const isFirebaseConfigured = () => {
  return Boolean(
    isValidApiKey(firebaseConfig.apiKey) &&
    firebaseConfig.projectId &&
    firebaseConfig.authDomain &&
    firebaseConfig.appId
  );
};
