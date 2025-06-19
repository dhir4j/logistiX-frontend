
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth'; // Uses AdminAuthContext
import { useAuth } from '@/hooks/use-auth'; // Also use main AuthContext for user details
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, UserCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


function AdminUserNav() {
  const { user } = useAuth(); // Get user from main AuthContext
  const { adminLogout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    adminLogout(); // This will call logoutUser from main AuthContext
    router.replace('/admin/login'); // Or /login if admin login is merged
  };

  if (!user || !user.isAdmin) return null; // Should not happen if layout protects correctly

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarFallback>
              <UserCircle className="h-7 w-7" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName} (Admin)</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function AdminHeader() {
  // const { adminUser, adminLogout } = useAdminAuth(); // Replaced by AdminUserNav
  // const router = useRouter();

  // const handleLogout = () => {
  //   adminLogout();
  //   router.replace('/admin/login');
  // };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold">
        <Image src="/images/brand.png" alt={siteConfig.name} width={150} height={37} className="object-contain"/>
        <span className="font-headline text-primary">Admin</span>
      </Link>
      <AdminUserNav />
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const { reloadUserFromStorage } = useAuth(); // From main AuthContext
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    reloadUserFromStorage(); // Attempt to reload on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAdminLoading && !isAdminAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAdminAuthenticated, isAdminLoading, router, pathname]);

  if (pathname === '/admin/login') {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-4 px-6 md:px-10 text-center border-t bg-background text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} Admin Panel. All rights reserved.
        </footer>
      </div>
    );
  }

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
            <span className="ml-3 text-lg text-destructive">Redirecting to Admin Login...</span>
        </div>
    );
  }
  
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
