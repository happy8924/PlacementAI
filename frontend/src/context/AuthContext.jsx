import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/auth';
import { getStudentProfile } from '../services/student';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async (userObj) => {
    const activeUser = userObj || user;
    if (!activeUser || activeUser.role !== 'student') {
      setStudentProfile(null);
      return;
    }
    setLoadingProfile(true);
    try {
      const res = await getStudentProfile();
      if (res.success && res.profile) {
        setStudentProfile(res.profile);
      }
    } catch (err) {
      console.warn('Could not load student profile on mount:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  // Initialize and load token/user from local storage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        if (parsedUser.role === 'student') {
          fetchProfile(parsedUser);
        }
      }
    } catch (e) {
      console.error('Failed to load authentication state from storage:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAction = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data.success && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setToken(data.access_token);
        setUser(data.user);

        if (data.user.role === 'student') {
          await fetchProfile(data.user);
        }
        return data;
      }
      throw new Error(data.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const signupAction = async (fields, registrationToken) => {
    setLoading(true);
    try {
      const data = await apiRegister(fields, registrationToken);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logoutAction = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
  };

  const updateProfileState = (updatedProfile) => {
    setStudentProfile(updatedProfile);
    if (updatedProfile && updatedProfile.full_name && user) {
      const newUser = { ...user, name: updatedProfile.full_name };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  // Helper check for complete profile
  const isProfileComplete = Boolean(
    studentProfile && (
      studentProfile.profile_completed ||
      (
        studentProfile.full_name &&
        studentProfile.branch &&
        studentProfile.graduation_year &&
        studentProfile.cgpa &&
        studentProfile.skills &&
        studentProfile.skills.length > 0 &&
        studentProfile.links &&
        (studentProfile.links.github || studentProfile.links.linkedin)
      )
    )
  );

  const value = {
    user,
    token,
    studentProfile,
    isProfileComplete,
    loadingProfile,
    isAuthenticated: !!token,
    loading,
    login: loginAction,
    signup: signupAction,
    logout: logoutAction,
    fetchStudentProfile: fetchProfile,
    updateProfileState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
