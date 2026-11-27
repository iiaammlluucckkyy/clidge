import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  registerAccount as apiRegisterAccount,
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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getPersistedSession());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const live = isLiveFirebase();

    if (!live) {
      const cached = getPersistedSession();
      if (isMounted) {
        setCurrentUser(cached);
        setIsLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists() && isMounted) {
            const data = snap.data();
            const fullProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
            };
            setCurrentUser(fullProfile);
            localStorage.setItem('clidge_current_session_v5', JSON.stringify(fullProfile));
          }
        } catch (err) {
          console.warn('Firestore profile restore:', err?.message);
        }
      } else if (isMounted) {
        setCurrentUser(null);
        localStorage.removeItem('clidge_current_session_v5');
      }

      if (isMounted) setIsLoading(false);
    });

    const fallbackTimer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 1500);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const registerAccount = async (formData) => {
    setAuthError(null);
    try {
      const user = await apiRegisterAccount(formData);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

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

  const login = async ({ email, password, requiredRole }) => {
    setAuthError(null);
    try {
      const user = await apiLoginUser({ email, password, requiredRole });
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    await apiLogoutUser();
    setCurrentUser(null);
  };

  const provisionTeacher = async (teacherData) => {
    return await apiProvisionTeacher(teacherData);
  };

  const requestPasswordReset = async (email) => {
    return await apiRequestPasswordReset(email);
  };

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
        registerAccount,
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
