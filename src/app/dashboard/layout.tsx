
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; 
import { useAuth } from '@/hooks/use-auth';
import { dashboardNavItems, siteConfig } from '@/config/site';
import { Logo } from '@/components/shared/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { LogOut, Menu, UserCircle, Loader2 } from 'lucide-react'; 
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { LandingFooter } from '@/app/page'; 

function UserNav() {
  const { user, logoutUser } = useAuth(); 
  const router = useRouter();

  const handleLogout = () => {
    logoutUser(); 
    router.replace('/login');
  };

  if (!user) return null;

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
            <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
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

function AppSidebar() {
  const pathname = usePathname();
  const { logoutUser } = useAuth(); 
  const router = useRouter();
  const { state } = useSidebar();

  const handleLogout = () => {
    logoutUser(); 
    router.replace('/login');
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader>
        <Logo collapsed={state === 'collapsed'} />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {dashboardNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.title, className: "font-headline"}}
                  className="font-body"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Log Out", className: "font-headline"}} className="font-body">
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}


function MobileSidebar() {
  const pathname = usePathname();
  const { logoutUser } = useAuth(); 
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    logoutUser(); 
    router.replace('/login');
    setOpen(false);
  };
  
  const handleLinkClick = () => {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground">
        <ScrollArea className="h-full">
          <div className="p-4">
            <SheetTitle className="sr-only">{siteConfig.name} Menu</SheetTitle> 
            <Logo />
          </div>
          <nav className="mt-4 flex flex-col gap-2 px-4">
            {dashboardNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                  ${(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground'}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-body text-base">{item.title}</span>
              </Link>
            ))}
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 px-3 py-2 text-base text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <LogOut className="h-5 w-5" />
              <span className="font-body">Log Out</span>
            </Button>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // isAuthenticated is now based on user presence, not token
  const { isAuthenticated, isLoading, user, reloadUserFromStorage } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    reloadUserFromStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    // If still loading or not authenticated (user is null), redirect to login
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);


  if (isLoading || !isAuthenticated) { 
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading Dashboard...</span>
      </div>
    );
  }
  
  const currentPage = dashboardNavItems.find(item => item.href === pathname || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
  const pageTitle = currentPage ? currentPage.title : siteConfig.name;


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="print:hidden"> {/* Hide sidebar for printing */}
          <AppSidebar />
        </div>
        <div className="flex flex-1 flex-col"> 
          <div className="print:hidden"> {/* Hide header for printing */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
              <div className="flex items-center gap-2">
                <MobileSidebar />
                <h1 className="text-xl font-headline font-semibold hidden md:block">{pageTitle}</h1>
              </div>
              <UserNav />
            </header>
          </div>
          <SidebarInset className="flex-1 print:m-0 print:p-0"> 
            <main className="flex-1 p-4 md:p-6 lg:p-8 print:p-0 print:m-0"> 
              {children}
            </main>
          </SidebarInset>
          <div className="print:hidden">
            <LandingFooter /> 
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
