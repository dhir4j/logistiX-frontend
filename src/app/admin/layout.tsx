
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth'; 
import { useAuth } from '@/hooks/use-auth'; 
import { adminNavItems, siteConfig } from '@/config/site';
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
import { cn } from '@/lib/utils';


function AdminUserNav() {
  const { user } = useAuth(); 
  const { adminLogout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    adminLogout(); 
    router.replace('/login'); // Redirect to main login as admin status is part of user object
  };

  // User must exist and be an admin to show this nav
  if (!user || !user.isAdmin) return null; 

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
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold">
          <Image src="/images/brand.png" alt={siteConfig.name} width={150} height={37} className="object-contain"/>
          <span className="font-headline text-primary">Admin</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {adminNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <AdminUserNav />
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // isAdminAuthenticated now relies on user.isAdmin from useAuth via useAdminAuth
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const { reloadUserFromStorage } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    reloadUserFromStorage(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If not loading and not admin authenticated, redirect to main login page
    // (as admin login is now part of the main login flow)
    if (!isAdminLoading && !isAdminAuthenticated && pathname !== '/admin/login' && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAdminAuthenticated, isAdminLoading, router, pathname]);

  // Admin login page itself is handled by its own page component logic
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
    // If not authenticated as admin, show loading/redirecting or simply don't render protected content.
    // The useEffect above handles redirection. This is a fallback.
    return (
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-destructive" />
            <span className="ml-3 text-lg text-destructive">Redirecting...</span>
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
