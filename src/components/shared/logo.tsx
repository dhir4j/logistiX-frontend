
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
  // This component might need updating if brand.png is also intended here.
  // For now, keeping the Package icon and text as per previous structure for login/footer.
  // If brand.png should be here too, further clarification is needed.
  const Package = () => ( // Defaulting to a simple SVG if lucide-react is not imported/used here
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2"/>
      <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"/>
      <path d="M3 10l9 5 9-5"/>
      <path d="M12 3.57v5.91M20.34 8.5l-8.68 4.82M3.66 8.5l8.68 4.82"/>
    </svg>
  );
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Using a generic package icon as brand.png might not fit the context of RS SWIFT COURIERS LLP here */}
      <Image src="/images/brand.png" alt="Shed Load Overseas Logo" width={120} height={32} className="object-contain mb-2"/>
      <p className="text-sm text-muted-foreground">RS SWIFT COURIERS LLP</p>
    </div>
  );
}
