import { Home, PackagePlus, Search, ListOrdered, MessageSquare, Receipt, Wallet, LayoutDashboard, Users } from 'lucide-react'; 
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
}

export const dashboardNavItems: NavItem[] = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: Home,
    description: 'Overview of your activities.',
  },
  {
    title: 'Book Shipment',
    href: '/dashboard/book-shipment',
    icon: PackagePlus,
    description: 'Create a new shipment.',
  },
  {
    title: 'Track Shipment',
    href: '/dashboard/track-shipment',
    icon: Search,
    description: 'Track an existing shipment.',
  },
  {
    title: 'My Shipments',
    href: '/dashboard/my-shipments',
    icon: ListOrdered,
    description: 'View your shipment history.',
  },
  {
    title: 'My Invoices',
    href: '/dashboard/my-invoices',
    icon: Receipt,
    description: 'View your invoices.',
  },
  {
    title: 'My Payments',
    href: '/dashboard/my-payments',
    icon: Wallet,
    description: 'Track your payment statuses.',
  },
  {
    title: 'Contact',
    href: '/dashboard/contact',
    icon: MessageSquare,
    description: 'Get support and contact information.',
  },
];

export const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Payments',
        href: '/admin/payments',
        icon: Wallet,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    }
];

export const siteConfig = {
  name: "Shed Load Overseas", // Brand name for UI
  description: "Courier and shipment management solutions by SHEDLOAD OVERSEAS LLP.",
  url: "https://shedloadoverseas.example.com", 
  ogImage: "https://shedloadoverseas.example.com/og.jpg", 
  mainNav: dashboardNavItems,
  company: { // New section for formal company details
    legalName: "SHEDLOAD OVERSEAS LLP",
    address: "Showroom no. 30, B Block, LGF, CHD, Citi Center, Zirakpur, Mohali, SAS Nagar, Punjab, 140603",
    email: "SHEDLOADOVERSEAS@GMAIL.COM",
    phone: "+91 95411 95406",
    gstin: "03AFPFS8245B1ZY",
    pan: "AFPFS8245B"
  },
  links: {
  },
};
