
"use client";

import type { User, LoginResponse } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { USER_DATA_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const performLogout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Failed to remove user data from localStorage", error);
    }
  }, []);

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
  }, []);


  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem(USER_DATA_KEY);

      if (storedUser) { 
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        performLogout(); 
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      performLogout();
    }
    setIsLoading(false);
  }, [performLogout]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);
  
  const reloadUserFromStorage = () => {
    loadUserFromStorage();
  };


  const loginUser = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiClient<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      setUser(response.user); 
      try {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
      setIsLoading(false);
      return response.user;
    } catch (error: any) {
      setIsLoading(false);
      handleApiError(error, 'login');
      throw error; 
    }
  }, [handleApiError]);

  const signupUser = useCallback(async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient<{ message: string }>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
      });
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error("Full error object during signup:", error);
      handleApiError(error, 'signup');
      throw error; 
    }
  }, [handleApiError]);

  const logoutUser = useCallback(() => {
    performLogout();
  }, [performLogout]);

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user,
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
