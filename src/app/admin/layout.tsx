
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

function AdminHeader() {
  const { adminUser, adminLogout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    adminLogout();
    router.replace('/admin/login');
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold">
        <Image src="/images/brand.png" alt={siteConfig.name} width={150} height={37} className="object-contain"/>
        <span className="font-headline text-primary">Admin</span>
      </Link>
      {adminUser && (
        <Button variant="ghost" onClick={handleLogout} size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      )}
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect if not loading, not authenticated, AND NOT on the login page
    if (!isAdminLoading && !isAdminAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAdminAuthenticated, isAdminLoading, router, pathname]);

  // If on the login page, always render the layout to avoid hydration issues
  if (pathname === '/admin/login') {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* Render a minimal header or no header for login page if desired */}
        {/* <AdminHeader /> */} 
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-4 px-6 md:px-10 text-center border-t bg-background text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} Admin Panel. All rights reserved.
        </footer>
      </div>
    );
  }

  // For protected pages:
  if (isAdminLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-100">Loading Admin Access...</div>;
  }

  if (!isAdminAuthenticated) {
    // This should ideally not be reached often due to the useEffect redirect,
    // but acts as a fallback.
    return <div className="flex h-screen items-center justify-center bg-gray-100">Redirecting to login...</div>;
  }
  
  // For authenticated users on protected pages
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <footer className="py-4 px-6 md:px-10 text-center border-t bg-background text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name} Admin Panel. All rights reserved.
      </footer>
    </div>
  );
}
