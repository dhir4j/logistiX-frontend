
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquare, MapPin, Info, Package, Globe, CreditCard, Send, Repeat } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 h-64 md:h-auto">
             <Image
                src="/images/girl.png"
                data-ai-hint="customer support"
                alt="Customer support representative"
                width={600}
                height={400}
                className="object-cover w-full h-full"
             />
          </div>
          <div className="p-8 md:w-1/2">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-primary" /> Get In Touch
              </CardTitle>
              <CardDescription>We're here to help! Reach out to us through any of the channels below.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Email Support</h4>
                  <p className="text-muted-foreground">Send us an email for any inquiries.</p>
                  <a href="mailto:SHEDLOADOVERSEAS@GMAIL.COM" className="text-primary hover:underline">SHEDLOADOVERSEAS@GMAIL.COM</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Phone Support</h4>
                  <p className="text-muted-foreground">Call us for immediate assistance.</p>
                  <a href="tel:+919541195406" className="text-primary hover:underline">+91 95411 95406</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Office Address</h4>
                  <p className="text-muted-foreground">Showroom no. 30, B Block, LGF, CHD, Citi Center, Zirakpur, Mohali, SAS Nagar, Punjab, 140603</p>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl sm:text-2xl">Our Core Services</CardTitle>
          <CardDescription>Comprehensive logistics solutions for your business.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Diverse Service Types</h4>
              <p className="text-sm text-muted-foreground">Courier, Cargo, Express, International, Domestic, Hyperlocal - We cover it all.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Wide Serviceable Area</h4>
              <p className="text-sm text-muted-foreground">Operating across India and Internationally.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Cash on Delivery (COD)</h4>
              <p className="text-sm text-muted-foreground">Flexible payment options available.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Send className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Tracking & Notifications</h4>
              <p className="text-sm text-muted-foreground">Stay updated via SMS, Email, and WhatsApp.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Repeat className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Reverse Pickup</h4>
              <p className="text-sm text-muted-foreground">Convenient return solutions for your needs.</p>
            </div>
          </div>
           <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold">Rate List</h4>
              <p className="text-sm text-muted-foreground">Please contact us for our detailed and competitive rate list.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
