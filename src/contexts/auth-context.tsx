
"use client";

import type { User, LoginResponse } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<User>;
  signupUser: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logoutUser: () => void;
  reloadUserFromStorage: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);
  
  const reloadUserFromStorage = () => {
    loadUserFromStorage();
  };


  const loginUser = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await apiClient<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      useAuthToken: false, 
    });
    
    setToken(response.accessToken);
    setUser(response.user);
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    return response.user;
  }, []);

  const signupUser = useCallback(async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    try {
      await apiClient<{ message: string }>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ firstName, lastName, email, password }),
          useAuthToken: false,
      });
      // User will need to login after signup
    } catch (error) {
      console.error("Full error object during signup:", error); // Enhanced logging
      // Re-throw the error so the component calling signupUser can also catch it and update UI (e.g., show toast)
      throw error;
    }
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        isAuthenticated: !!token && !!user, 
        isLoading, 
        loginUser, 
        signupUser,
        logoutUser,
        reloadUserFromStorage
    }}>
      {children}
    </AuthContext.Provider>
  );
};
