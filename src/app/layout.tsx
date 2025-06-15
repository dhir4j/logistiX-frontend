
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import './globals.css';
// LandingFooter removed from global layout

export const metadata: Metadata = {
  title: 'Shed Load Overseas - RS SWIFT COURIERS LLP',
  description: 'Courier and shipment management solutions by Shed Load Overseas.',
  icons: {
    icon: '/favicon.ico', 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground flex flex-col min-h-screen">
        <Providers>
          <div className="flex-1 flex flex-col"> {/* This div ensures children take available space */}
            {children}
          </div>
          {/* LandingFooter removed from here */}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
