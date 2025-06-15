
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyLogo } from '@/components/shared/logo';
import { ArrowRight, DollarSign, MessageCircle, PackageCheck, SearchCheck, ShieldCheck, Zap, Loader2 } from 'lucide-react';

function LandingHeader() {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b">
      <CompanyLogo />
      <nav className="space-x-2 sm:space-x-4">
        <Button asChild variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Sign Up</Link>
        </Button>
      </nav>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="py-8 px-6 md:px-10 text-center border-t bg-muted/50">
      <div className="container mx-auto">
        <CompanyLogo className="mb-4 justify-center" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SwiftTrack - RS SWIFT COURIERS LLP. All rights reserved.
        </p>
        <div className="mt-4 space-x-4">
          <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Privacy Policy</Link>
          <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Terms of Service</Link>
          <Link href="/dashboard/contact" className="text-xs text-muted-foreground hover:text-primary">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null; 

  const features = [
    {
      icon: Zap,
      title: "Easy Booking",
      description: "Schedule your shipments in just a few clicks with our intuitive platform.",
      dataAiHint: "fast booking"
    },
    {
      icon: SearchCheck,
      title: "Real-Time Tracking",
      description: "Stay updated with live tracking of your packages from pickup to delivery.",
      dataAiHint: "map tracking"
    },
    {
      icon: ShieldCheck,
      title: "Secure & Reliable",
      description: "Trust us with your valuable shipments. We ensure safety and reliability every step of the way.",
      dataAiHint: "secure delivery"
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "No hidden fees. Calculate your shipping costs upfront with our simple pricing calculator.",
      dataAiHint: "price calculator"
    },
    {
      icon: PackageCheck,
      title: "Wide Coverage",
      description: "We deliver across a vast network, ensuring your package reaches its destination efficiently.",
      dataAiHint: "global shipping"
    },
    {
      icon: MessageCircle,
      title: "Dedicated Support",
      description: "Our friendly customer support team is always ready to assist you with any queries.",
      dataAiHint: "customer support"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 px-6 md:px-10 bg-gradient-to-br from-primary/10 via-background to-background text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary mb-6">
              Reliable Shipments, Delivered Swiftly.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Experience seamless courier services with SwiftTrack. Book, track, and manage your deliveries with unparalleled ease and confidence.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild className="font-semibold text-lg py-3 px-8 w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/login">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {/* <Button size="lg" variant="outline" className="font-semibold text-lg py-3 px-8 w-full sm:w-auto">
                Learn More
              </Button> */}
            </div>
            <div className="mt-12">
              <Image 
                src="https://placehold.co/800x450.png" 
                alt="SwiftTrack dashboard preview" 
                data-ai-hint="logistics truck delivery"
                width={800} 
                height={450}
                className="rounded-lg shadow-2xl mx-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 px-6 md:px-10">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-4">
              Everything You Need for Effortless Shipping
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              SwiftTrack provides a comprehensive suite of tools to make your shipping experience smooth and efficient.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                  <CardHeader className="items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full inline-block mb-4 border border-primary/20">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 px-6 md:px-10 bg-muted/30">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-12">
                    Shipping Made Simple: Just 3 Steps
                </h2>
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {[
                        { title: "Book Your Shipment", description: "Enter details, choose service, and schedule a pickup in minutes.", hint: "online booking form", number: 1 },
                        { title: "Track Your Package", description: "Monitor your package's journey with our real-time tracking system.", hint: "package on map", number: 2 },
                        { title: "Secure Delivery", description: "Receive confirmation upon successful and safe delivery to the recipient.", hint: "package delivered hand", number: 3 }
                    ].map(step => (
                        <div key={step.number} className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-6 shadow-md">
                                {step.number}
                            </div>
                            <Image 
                                src={`https://placehold.co/400x300.png`} 
                                data-ai-hint={step.hint}
                                alt={step.title} 
                                width={400} 
                                height={300} 
                                className="rounded-lg shadow-sm mb-6 object-cover aspect-[4/3]" 
                            />
                            <h3 className="text-xl font-semibold font-headline mb-2">{step.title}</h3>
                            <p className="text-muted-foreground text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-6 md:px-10 bg-gradient-to-r from-accent/80 to-primary/80 text-center">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary-foreground mb-6">
              Ready to Revolutionize Your Shipments?
            </h2>
            <p className="text-lg text-background/90 mb-8">
              Join thousands of satisfied customers who trust SwiftTrack for their critical courier needs. Sign up today and experience the difference.
            </p>
            <Button size="lg" asChild className="font-semibold text-lg py-3 px-8 bg-background text-primary hover:bg-background/90 shadow-xl hover:shadow-2xl transition-shadow">
              <Link href="/login">
                Create Your First Shipment <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
