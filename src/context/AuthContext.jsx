import React, { createContext, useContext, useState } from 'react';
import { SAMPLE_STUDENT_PROFILE, SAMPLE_TEACHER_PROFILE } from '../data/sampleStudents';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Roles: 'student' | 'teacher' | 'guest'
  const [currentRole, setCurrentRole] = useState('student');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const currentUser = currentRole === 'student' ? SAMPLE_STUDENT_PROFILE : SAMPLE_TEACHER_PROFILE;

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    setIsAuthenticated(true);
  };

  const loginAs = (role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        isAuthenticated,
        isDemoMode: true,
        switchRole,
        loginAs,
        logout
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
