
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CompanyLogo } from '@/components/shared/logo';
import { ArrowRight, DollarSign, MessageCircle, PackageCheck, SearchCheck, ShieldCheck, Zap, Loader2, Globe, CreditCard, Send, Repeat, Truck, Users, Info } from 'lucide-react';

export function LandingHeader() {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b">
      <Link href="/" className="flex items-center text-primary hover:text-primary/90">
        <Image
          src="/images/brand.png"
          alt="Shed Load Overseas Logo"
          width={180} 
          height={45} 
          className="object-contain"
          priority
        />
      </Link>
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

export function LandingFooter() {
  return (
    <footer className="py-8 px-6 md:px-10 text-center border-t bg-muted/50">
      <div className="container mx-auto">
        <CompanyLogo className="mb-4 justify-center" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Shed Load Overseas - RS SWIFT COURIERS LLP. All rights reserved.
        </p>
        <div className="mt-4 space-x-4 flex flex-wrap justify-center">
          <Link href="/about" className="text-xs text-muted-foreground hover:text-primary">About Us</Link>
          <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary">Privacy Policy</Link>
          <Link href="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary">Terms of Service</Link>
          <Link href="/dashboard/contact" className="text-xs text-muted-foreground hover:text-primary">Contact Us</Link>
          <Link href="/dashboard/contact" className="text-xs text-muted-foreground hover:text-primary">Customer Care</Link>
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

  const coreFeatures = [
    {
      icon: Zap,
      title: "Easy Booking",
      description: "Schedule shipments in clicks with our intuitive platform.",
    },
    {
      icon: SearchCheck,
      title: "Real-Time Tracking",
      description: "Live tracking from pickup to delivery via Web, SMS, Email & WhatsApp.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Reliable",
      description: "Trust us with your valuable shipments. Safety and reliability, every step.",
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "No hidden fees. Contact us for a detailed rate list.",
    },
    {
      icon: Globe,
      title: "Wide Coverage",
      description: "Domestic and International services, reaching your destination efficiently.",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Friendly customer support ready to assist with any queries.",
    }
  ];

  const serviceHighlights = [
    { icon: PackageCheck, title: "Comprehensive Services", description: "Courier, Cargo, Express, International, Domestic, and Hyperlocal solutions tailored to your needs." },
    { icon: CreditCard, title: "Cash on Delivery (COD)", description: "Flexible payment options including Cash on Delivery for your convenience." },
    { icon: Repeat, title: "Reverse Pickup", description: "Efficient and hassle-free reverse pickup services for returns and exchanges." },
    { icon: Send, title: "Multi-Channel Notifications", description: "Stay informed with updates via SMS, Email, and WhatsApp." },
    { icon: Info, title: "Rate List", description: "Contact us for our competitive rate list tailored to your shipping volume and needs." },
    { icon: Truck, title: "Serviceable Area", description: "Operating across India and Internationally, ensuring your packages reach their destination." }
  ];

  const howItWorksSteps = [
    { 
      title: "Book Your Shipment", 
      description: "Enter details, choose service, and schedule a pickup in minutes.", 
      number: 1,
      svg: (
        <svg width="300" height="225" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg shadow-sm mb-6 object-cover aspect-[4/3]">
          <rect width="100" height="75" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.5"/>
          <rect x="25" y="15" width="50" height="45" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--primary))" strokeWidth="1"/>
          <line x1="35" y1="25" x2="65" y2="25" stroke="hsl(var(--primary) / 0.7)" strokeWidth="1"/>
          <line x1="35" y1="32" x2="65" y2="32" stroke="hsl(var(--primary) / 0.7)" strokeWidth="1"/>
          <line x1="35" y1="39" x2="55" y2="39" stroke="hsl(var(--primary) / 0.7)" strokeWidth="1"/>
          <circle cx="60" cy="50" r="10" fill="hsl(var(--primary))"/>
          <line x1="60" y1="45" x2="60" y2="55" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5"/>
          <line x1="55" y1="50" x2="65" y2="50" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      title: "Track Your Package", 
      description: "Monitor your package's journey with our real-time tracking system.", 
      number: 2,
      svg: (
        <svg width="300" height="225" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg shadow-sm mb-6 object-cover aspect-[4/3]">
          <rect width="100" height="75" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.5"/>
          <path d="M15 60 Q 30 40, 50 50 T 85 20" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <rect x="45" y="28" width="10" height="8" rx="1" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
          <circle cx="50" cy="32" r="3" fill="hsl(var(--primary))"/>
          <path d="M50 35 L 48 40 L 52 40 Z" fill="hsl(var(--primary))" />
          <circle cx="70" cy="45" r="8" stroke="hsl(var(--accent-foreground))" strokeWidth="1.5" fill="hsl(var(--accent)/0.3)"/>
          <line x1="76" y1="51" x2="82" y2="57" stroke="hsl(var(--accent-foreground))" strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      title: "Secure Delivery", 
      description: "Receive confirmation upon successful and safe delivery to the recipient.", 
      number: 3,
      svg: (
        <svg width="300" height="225" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg shadow-sm mb-6 object-cover aspect-[4/3]">
          <rect width="100" height="75" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.5"/>
          <path d="M50 15 L80 25 L80 45 C80 60, 50 70, 50 70 C50 70, 20 60, 20 45 L20 25 L50 15 Z" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
          <path d="M40 40 L50 50 L65 30" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="60" y="50" width="15" height="10" rx="1" fill="hsl(var(--accent))" stroke="hsl(var(--accent-foreground))" strokeWidth="0.5" opacity="0.7"/>
        </svg>
      ) 
    }
  ];


  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 px-6 md:px-10 bg-gradient-to-br from-primary/10 via-background to-background text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary mb-6">
              Shed Load Overseas: <br /> Your Global Logistics Partner.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Experience seamless courier and cargo services with Shed Load Overseas. Book, track, and manage your deliveries with unparalleled ease and confidence, worldwide.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild className="font-semibold text-lg py-3 px-8 w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            {/* SVG Removed from here */}
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-16 md:py-24 px-6 md:px-10">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-4">
              Everything You Need for Effortless Shipping
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Shed Load Overseas provides a comprehensive suite of tools to make your shipping experience smooth and efficient.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature) => (
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
        
        {/* Service Highlights Section */}
        <section className="py-16 md:py-24 px-6 md:px-10 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center mb-4">
              Our Specialized Services
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Tailored solutions to meet all your logistical requirements.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {serviceHighlights.map((service) => (
                <Card key={service.title} className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
                   <CardHeader className="flex flex-row items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg inline-block border border-primary/20">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* How It Works Section */}
        <section className="py-16 md:py-24 px-6 md:px-10">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-12">
                    Shipping Made Simple: Just 3 Steps
                </h2>
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {howItWorksSteps.map(step => (
                        <div key={step.number} className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-6 shadow-md">
                                {step.number}
                            </div>
                            {step.svg}
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
              Ready to Streamline Your Shipments?
            </h2>
            <p className="text-lg text-background/90 mb-8">
              Join businesses worldwide who trust Shed Load Overseas for their critical courier and cargo needs. Sign up today and experience the difference.
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
