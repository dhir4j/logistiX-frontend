
"use client";

import React, { createContext, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth'; // We'll rely on the main AuthContext

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean; // Reflects main auth loading
  adminLogout: () => void; // Wraps main logout
  // adminLogin is handled by the main AuthProvider now,
  // this context just checks the isAdmin flag.
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, logoutUser, token } = useAuth();

  const isAdminAuthenticated = !!token && !!user && user.isAdmin;

  const adminLogout = useCallback(() => {
    logoutUser(); // Calls the main logout function
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
