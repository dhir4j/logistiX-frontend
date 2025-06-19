
"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ShipmentProvider } from '@/contexts/shipment-context';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { InvoiceProvider } from '@/contexts/invoice-context';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <ShipmentProvider>
          <InvoiceProvider>
            {children}
          </InvoiceProvider>
        </ShipmentProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
};
