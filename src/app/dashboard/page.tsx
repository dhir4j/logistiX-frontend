
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackagePlus, Search, ListOrdered, Calculator, MessageSquare, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const quickAccessItems = [
  { title: 'Book a New Shipment', href: '/dashboard/book-shipment', icon: PackagePlus, description: 'Start a new shipment process quickly.' },
  { title: 'Track Your Package', href: '/dashboard/track-shipment', icon: Search, description: 'Check the status of your existing shipment.' },
  { title: 'View My Shipments', href: '/dashboard/my-shipments', icon: ListOrdered, description: 'Access your shipment history and details.' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Welcome, {user.firstName || user.email.split('@')[0]}!</CardTitle>
          <CardDescription className="text-lg">Manage your shipments efficiently with Shed Load Overseas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your central hub for all courier activities. You can book new shipments, track existing ones, view your history, calculate pricing, and get in touch with us for support.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickAccessItems.map((item) => (
          <Card key={item.href} className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-headline font-medium">{item.title}</CardTitle>
              <item.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 animated-outline-hover">
                <Link href={item.href}>
                  Go to {item.title.split(' ')[0]} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-6 md:p-8">
            <h3 className="font-headline text-2xl font-semibold mb-3 text-primary">Need Assistance?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is ready to help you with any queries or issues you might have.
              Explore our contact options or use the pricing calculator for quick estimates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/dashboard/contact">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/pricing">
                  <Calculator className="mr-2 h-4 w-4" /> Pricing Calculator
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block p-4"> {/* Added padding for visual separation */}
            <Image
              src="/images/second.png"
              alt="Customer Support Illustration"
              width={400} // Reduced width
              height={267} // Reduced height (maintaining aspect ratio approx 3:2)
              className="object-cover w-full rounded-md" // Added rounded-md for aesthetics
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
