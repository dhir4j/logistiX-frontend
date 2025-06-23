
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shed Load Overseas',
  description: 'Courier and shipment management solutions by Shed Load Overseas.',
  icons: {
<<<<<<< HEAD
    icon: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
    shortcut: { url: "/favicon.ico", type: "image/x-icon" },
=======
    icon: '/favicon.ico', 
>>>>>>> 9b75c106224b64d7f36b5ea78401b727420310ca
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
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
