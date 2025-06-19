
"use client";

import React, { createContext, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean; // Based on user.isAdmin
  isAdminLoading: boolean;       // Directly from main auth loading
  adminLogout: () => void;       // Wraps main logout
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, logoutUser } = useAuth();

  // isAdminAuthenticated now directly relies on the user object's isAdmin flag
  const isAdminAuthenticated = !!user && user.isAdmin;

  const adminLogout = useCallback(() => {
    logoutUser(); 
  }, [logoutUser]);


  return (
    <AdminAuthContext.Provider value={{ 
      isAdminAuthenticated, 
      isAdminLoading: isLoading, 
      adminLogout
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
