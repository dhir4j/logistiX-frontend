"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ShipmentProvider } from '@/contexts/shipment-context';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ShipmentProvider>
        {children}
      </ShipmentProvider>
    </AuthProvider>
  );
};
