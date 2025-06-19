
"use client";

import type { User, LoginResponse } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast'; // For displaying 422 errors

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
  const { toast } = useToast();

  const performLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    // Redirection to /login will be handled by layout components observing isAuthenticated
  }, []);

  const handleApiAuthError = useCallback((error: any, operation: string) => {
    if (error.status === 422) {
      toast({
        title: "Authentication Error",
        description: "Your session is invalid. Please log in again.",
        variant: "destructive",
      });
      performLogout();
    } else {
      // Handle other errors (e.g., display a generic error toast)
      console.error(`API error during ${operation}:`, error);
      // Do not throw here if already handled in calling function (like signup/login)
    }
  }, [toast, performLogout]);


  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // No need to decode token here for isAdmin if API response for login is trusted
        // and storedUser already contains the isAdmin flag correctly.
      } else {
        // If no token or user, ensure clean state
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
        useAuthToken: false, 
      });
      
      setToken(response.accessToken);
      setUser(response.user); // user object from API includes isAdmin
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
      setIsLoading(false);
      return response.user;
    } catch (error: any) {
      setIsLoading(false);
      handleApiAuthError(error, 'login');
      throw error; // Re-throw for the form to handle specific login errors (e.g., invalid credentials)
    }
  }, [handleApiAuthError]);

  const signupUser = useCallback(async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient<{ message: string }>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ firstName, lastName, email, password }),
          useAuthToken: false,
      });
      // User will need to login after signup
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error("Full error object during signup:", error);
      handleApiAuthError(error, 'signup');
      throw error; // Re-throw for the form to handle specific signup errors
    }
  }, [handleApiAuthError]);

  // Expose performLogout as logoutUser
  const logoutUser = useCallback(() => {
    performLogout();
  }, [performLogout]);

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
