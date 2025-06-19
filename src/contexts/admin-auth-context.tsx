
"use client";

import type { User } from '@/lib/types'; // Re-using User type for simplicity, can be a specific AdminUser type
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AdminAuthContextType {
  adminUser: User | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  adminLogin: (username: string) // Simple login, can be expanded
    => void;
  adminLogout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY_USER = 'shedloadoverseas_admin_user';

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAdminUser = localStorage.getItem(ADMIN_STORAGE_KEY_USER);
      if (storedAdminUser) {
        setAdminUser(JSON.parse(storedAdminUser));
      }
    } catch (error) {
      console.error("Failed to load admin user from localStorage", error);
      localStorage.removeItem(ADMIN_STORAGE_KEY_USER);
    }
    setIsAdminLoading(false);
  }, []);

  const adminLogin = useCallback((username: string) => {
    // For this demo, username is enough to identify, password check is done in form
    const adminData: User = { 
      id: 'admin-user-id',
      email: `${username}@admin.local`, // Placeholder email
      firstName: username.charAt(0).toUpperCase() + username.slice(1), 
      lastName: 'Admin' 
    };
    setAdminUser(adminData);
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY_USER, JSON.stringify(adminData));
    } catch (error) {
      console.error("Failed to save admin user to localStorage", error);
    }
  }, []);

  const adminLogout = useCallback(() => {
    setAdminUser(null);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY_USER);
    } catch (error) {
      console.error("Failed to remove admin user from localStorage", error);
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAdminAuthenticated: !!adminUser, isAdminLoading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
