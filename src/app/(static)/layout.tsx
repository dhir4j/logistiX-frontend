
import type { Metadata } from 'next';
import { LandingHeader } from '@/app/page'; // Re-use from home page

export const metadata: Metadata = {
  title: 'Shed Load Overseas',
  description: 'Information pages for Shed Load Overseas.',
};

export default function StaticPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground"> {/* Ensure this takes up space */}
      <LandingHeader />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6"> {/* main content also flex-1 */}
        {children}
      </main>
      {/* LandingFooter removed from here, it's now global */}
    </div>
  );
}
