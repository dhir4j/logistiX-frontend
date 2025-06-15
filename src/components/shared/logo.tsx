
import { Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center justify-start gap-2 p-2 text-primary hover:text-primary/90">
      {collapsed ? (
        <Image
          src="https://placehold.co/32x32.png"
          alt="App Placeholder Icon"
          data-ai-hint="icon placeholder"
          width={32}
          height={32}
          className="mx-auto"
        />
      ) : (
        <Image
          src="https://placehold.co/200x32.png"
          alt="App Placeholder Logo"
          data-ai-hint="logo placeholder"
          width={200}
          height={32}
        />
      )}
    </Link>
  );
}

export function CompanyLogo({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Package className="h-12 w-12 text-primary" />
      <h1 className="mt-2 text-2xl font-headline font-semibold text-primary">Shed Load Overseas</h1>
      <p className="text-sm text-muted-foreground">RS SWIFT COURIERS LLP</p>
    </div>
  );
}
