
import Link from 'next/link';
import Image from 'next/image';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center justify-start gap-2 p-2 text-primary hover:text-primary/90">
      {collapsed ? (
        <Image
          src="/images/brand.png"
          alt="App Icon"
          width={32}
          height={32}
          className="mx-auto object-contain"
        />
      ) : (
        <Image
          src="/images/brand.png"
          alt="App Logo"
          width={150} 
          height={40} 
          className="object-contain"
        />
      )}
    </Link>
  );
}

export function CompanyLogo({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Image src="/images/brand.png" alt="Shed Load Overseas Logo" width={120} height={32} className="object-contain mb-2"/>
      {/* RS SWIFT COURIERS LLP text removed */}
    </div>
  );
}
