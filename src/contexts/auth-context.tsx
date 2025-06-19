
"use client";

import type { User, LoginResponse } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { USER_DATA_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  // token: string | null; // Removed token
  isAuthenticated: boolean; // Will be true if user is not null
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<User>;
  signupUser: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logoutUser: () => void;
  reloadUserFromStorage: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // const [token, setToken] = useState<string | null>(null); // Removed token state
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const performLogout = useCallback(() => {
    setUser(null);
    // setToken(null); // Removed token
    try {
      // localStorage.removeItem(AUTH_TOKEN_KEY); // Removed token key
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Failed to remove user data from localStorage", error);
    }
  }, []);

  const handleApiError = useCallback((error: any, operation: string) => {
    // Removed 422 handling for authentication issues as per new requirements
    // Generic error logging and toasting can remain if desired for other errors
    console.error(`API error during ${operation}:`, error);
    // Example: Toast for generic server errors if not handled by specific forms
    // if (error.status && error.status >= 500) {
    //   toast({
    //     title: "Server Error",
    //     description: "An unexpected error occurred on the server. Please try again later.",
    //     variant: "destructive",
    //   });
    // }
    // No automatic logout for 422 as it's not an auth token issue anymore
  }, [toast, performLogout]);


  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      // const storedToken = localStorage.getItem(AUTH_TOKEN_KEY); // Removed token
      const storedUser = localStorage.getItem(USER_DATA_KEY);

      if (storedUser) { // Check only for storedUser now
        // setToken(storedToken); // Removed token
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        performLogout(); // Clear user if no data found
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
      // LoginResponse no longer contains accessToken
      const response = await apiClient<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        // useAuthToken: false, // This option is removed from apiClient
      });
      
      // setToken(response.accessToken); // No accessToken in response
      setUser(response.user); 
      try {
        // localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken); // No accessToken
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
      setIsLoading(false);
      return response.user;
    } catch (error: any) {
      setIsLoading(false);
      handleApiError(error, 'login'); // General error handling
      throw error; 
    }
  }, [handleApiError]);

  const signupUser = useCallback(async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient<{ message: string }>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ firstName, lastName, email, password }),
          // useAuthToken: false, // Removed
      });
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error("Full error object during signup:", error);
      handleApiError(error, 'signup'); // General error handling
      throw error; 
    }
  }, [handleApiError]);

  const logoutUser = useCallback(() => {
    performLogout();
  }, [performLogout]);

  return (
    <AuthContext.Provider value={{ 
        user, 
        // token, // Removed token
        isAuthenticated: !!user, // isAuthenticated is now based on user presence
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
