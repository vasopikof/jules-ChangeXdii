'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, getUser, saveUser } from '@/lib/db';

interface UserContextType {
  user: UserProfile | null;
  login: (id: string) => Promise<boolean>;
  logout: () => void;
  register: (user: UserProfile) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (id: string) => {
    setIsLoading(true);
    try {
      const userProfile = await getUser(id);
      if (userProfile) {
        setUser(userProfile);
        localStorage.setItem('app_user', JSON.stringify(userProfile));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  const register = async (userProfile: UserProfile) => {
    setIsLoading(true);
    try {
      await saveUser(userProfile);
      setUser(userProfile);
      localStorage.setItem('app_user', JSON.stringify(userProfile));
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
