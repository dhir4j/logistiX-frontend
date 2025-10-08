
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth'; 
import { useAuth } from '@/hooks/use-auth'; 
import { siteConfig } from '@/config/site';
import { Loader2 } from 'lucide-react';

// This is a minimal layout specifically for the invoice printing view.
// It removes the main admin header and footer to provide a clean page for printing.

export default function AdminInvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const { reloadUserFromStorage } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    reloadUserFromStorage(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAdminLoading && !isAdminAuthenticated) {
      router.replace('/login');
    }
  }, [isAdminAuthenticated, isAdminLoading, router]);


  if (isAdminLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading Admin Access...</span>
        </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-destructive" />
            <span className="ml-3 text-lg text-destructive">Redirecting...</span>
        </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 print:bg-white">
      <main className="flex-1 p-4 md:p-6 lg:p-8 print:p-0 print:m-0">
        {children}
      </main>
      <footer className="py-4 px-6 md:px-10 text-center border-t bg-background text-xs text-muted-foreground print:hidden">
        © {new Date().getFullYear()} {siteConfig.name} Admin Panel. All rights reserved.
      </footer>
    </div>
  );
}
