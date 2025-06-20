
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackagePlus, Search, ListOrdered, MessageSquare, ArrowRight, Settings2, BarChartBig, Gift, Receipt } from 'lucide-react'; // Calculator removed
import Image from 'next/image';

const quickAccessItems = [
  { title: 'Book a New Shipment', href: '/dashboard/book-shipment', icon: PackagePlus, description: 'Start a new shipment process quickly.' },
  { title: 'Track Your Package', href: '/dashboard/track-shipment', icon: Search, description: 'Check the status of your existing shipment.' },
  { title: 'View My Shipments', href: '/dashboard/my-shipments', icon: ListOrdered, description: 'Access your shipment history and details.' },
  { title: 'View My Invoices', href: '/dashboard/my-invoices', icon: Receipt, description: 'Access your invoice history.' },
];

const additionalInfoCards = [
  {
    icon: Settings2,
    title: "Our Core Services",
    description: "From express delivery to bulk cargo and international shipping, we offer a wide range of logistics solutions tailored to your needs.",
    link: "/about",
    linkLabel: "Learn More"
  },
  {
    icon: BarChartBig,
    title: "Solutions for Your Business",
    description: "Empower your e-commerce, supply chain, and enterprise logistics with our reliable and scalable B2B services, including COD and reverse pickups.",
    link: "/dashboard/contact",
    linkLabel: "Discuss Your Needs"
  },
  {
    icon: Gift,
    title: "Latest Updates & Offers",
    description: "Stay informed about new service areas, special promotions, and operational updates to make the most of Shed Load Overseas.",
    link: "#", 
    linkLabel: "View Announcements"
  }
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; // Should be handled by layout, but good practice

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl sm:text-3xl text-primary">Welcome, {user.firstName || user.email.split('@')[0]}!</CardTitle>
          <CardDescription className="text-lg">Manage your shipments efficiently with Shed Load Overseas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your central hub for all courier activities. You can book new shipments, track existing ones, view your history and invoices, and get in touch with us for support.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"> {/* Changed to lg:grid-cols-4 */}
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
        <div className="grid md:grid-cols-3 items-center"> 
          <div className="p-6 md:p-8 md:col-span-2"> 
            <h3 className="font-headline text-xl sm:text-2xl font-semibold mb-3 text-primary">Need Assistance?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is ready to help you with any queries or issues you might have.
              Explore our contact options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/dashboard/contact">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact Support
                </Link>
              </Button>
              {/* Pricing Calculator Button Removed */}
              {/* 
              <Button asChild variant="outline">
                <Link href="/dashboard/pricing">
                  <Calculator className="mr-2 h-4 w-4" /> Pricing Calculator
                </Link>
              </Button> 
              */}
            </div>
          </div>
          <div className="hidden md:block p-4 md:col-span-1"> 
            <Image
              src="/images/second.png"
              alt="Customer Support Illustration"
              width={200} 
              height={133} 
              className="object-contain rounded-md mx-auto" 
              data-ai-hint="customer service"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {additionalInfoCards.map((card) => (
          <Card key={card.title} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <card.icon className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl font-headline font-medium">{card.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
            <CardContent className="pt-0 flex-shrink-0"> 
              <Button asChild variant="link" className="p-0 text-primary hover:text-primary/80">
                <Link href={card.link}>
                  {card.linkLabel} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
