import { Package } from 'lucide-react';
import Link from 'next/link';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 p-2 text-primary hover:text-primary/90">
      <Package className={`h-8 w-8 ${collapsed ? 'mx-auto' : ''}`} />
      {!collapsed && <span className="text-xl font-headline font-semibold">SwiftTrack</span>}
    </Link>
  );
}

export function CompanyLogo({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Package className="h-12 w-12 text-primary" />
      <h1 className="mt-2 text-2xl font-headline font-semibold text-primary">SwiftTrack</h1>
      <p className="text-sm text-muted-foreground">RS SWIFT COURIERS LLP</p>
    </div>
  );
}
