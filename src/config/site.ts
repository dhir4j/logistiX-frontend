import { Home, PackagePlus, Search, ListOrdered, Calculator, MessageSquare, LogOut, UserCircle } from 'lucide-react';
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
    title: 'Pricing',
    href: '/dashboard/pricing',
    icon: Calculator,
    description: 'Calculate shipment costs.',
  },
  {
    title: 'Contact',
    href: '/dashboard/contact',
    icon: MessageSquare,
    description: 'Get support and contact information.',
  },
];

export const siteConfig = {
  name: "Shed Load Overseas",
  description: "RS SWIFT COURIERS LLP - Courier and shipment management by Shed Load Overseas.",
  url: "https://shedloadoverseas.example.com", 
  ogImage: "https://shedloadoverseas.example.com/og.jpg", 
  mainNav: dashboardNavItems,
  links: {
  },
};
