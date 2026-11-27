import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  registerStudent as apiRegisterStudent,
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getPersistedSession,
  provisionTeacherAccount as apiProvisionTeacher,
  requestPasswordReset as apiRequestPasswordReset,
  sendVerificationEmail as apiSendVerificationEmail,
  isLiveFirebase
} from '../services/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and restore authentication on page refresh
  useEffect(() => {
    let isMounted = true;

    // 1. First check persisted session in localStorage for immediate hydration
    const cachedSession = getPersistedSession();
    if (cachedSession && isMounted) {
      setCurrentUser(cachedSession);
    }

    // 2. Listen to real Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore `users/{uid}`
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists() && isMounted) {
            const firestoreData = snap.data();
            const fullProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...firestoreData
            };
            setCurrentUser(fullProfile);
            localStorage.setItem('clidge_current_session_v4', JSON.stringify(fullProfile));
          }
        } catch (err) {
          console.warn('Firestore user fetch onAuthStateChanged:', err);
        }
      } else if (!cachedSession && isMounted) {
        setCurrentUser(null);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    // Fallback timer so loading screen never hangs
    const timer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 700);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  /**
   * Register a new student
   * Enforces role = 'student'
   */
  const registerStudent = async (formData) => {
    setAuthError(null);
    try {
      const user = await apiRegisterStudent(formData);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * Login as Student or Teacher
   * Verifies required role
   */
  const login = async ({ email, password, requiredRole, allowAutoProvision = false }) => {
    setAuthError(null);
    try {
      const user = await apiLoginUser({ email, password, requiredRole, allowAutoProvision });
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * Sign Out
   */
  const logout = async () => {
    setAuthError(null);
    await apiLogoutUser();
    setCurrentUser(null);
  };

  /**
   * Admin Provision Teacher
   */
  const provisionTeacher = async (teacherData) => {
    return await apiProvisionTeacher(teacherData);
  };

  /**
   * Request Password Reset
   */
  const requestPasswordReset = async (email) => {
    return await apiRequestPasswordReset(email);
  };

  /**
   * Send Email Verification
   */
  const sendVerificationEmail = async () => {
    return await apiSendVerificationEmail();
  };

  const currentRole = currentUser?.role || null;
  const isAuthenticated = Boolean(currentUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        isLoading,
        authError,
        isLiveFirebase: isLiveFirebase(),
        registerStudent,
        login,
        logout,
        provisionTeacher,
        requestPasswordReset,
        sendVerificationEmail,
        setAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
