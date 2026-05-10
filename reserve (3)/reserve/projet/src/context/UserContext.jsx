import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('auth/user/');
      if (res.data) {
        setUserData(res.data);
        // Persist basic info to localStorage as a fallback
        localStorage.setItem('firstName', res.data.first_name || '');
        localStorage.setItem('lastName', res.data.last_name || '');
        if (res.data.profile?.image) {
          localStorage.setItem('profileImage', res.data.profile.image);
        }
      }
    } catch (err) {
      console.error("Error fetching user in Context:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        setUserData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.clear();
    setUserData(null);
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, loading, fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
