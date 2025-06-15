
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquare, MapPin, Info } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
             <Image
                src="https://placehold.co/600x400.png"
                alt="Contact Us Illustration"
                data-ai-hint="contact support"
                width={600}
                height={400}
                className="object-cover w-full h-full"
             />
          </div>
          <div className="p-8 md:w-1/2">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="font-headline text-3xl flex items-center gap-2">
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
                  <a href="mailto:support@rswift.com" className="text-primary hover:underline">support@rswift.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Phone Support</h4>
                  <p className="text-muted-foreground">Call us for immediate assistance.</p>
                  <a href="tel:+911234567890" className="text-primary hover:underline">+91 123 456 7890</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Office Address</h4>
                  <p className="text-muted-foreground">RS SWIFT COURIERS LLP<br />123 Business Park, Example City, ST 12345, India</p>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Live Chat & WhatsApp</CardTitle>
          <CardDescription>Connect with us instantly for quick support. (Simulated)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white">
            <MessageSquare className="mr-2 h-5 w-5" /> Chat on WhatsApp (Simulated)
          </Button>
          <Button variant="outline" className="w-full sm:w-auto border-accent text-accent hover:bg-accent/10">
            <Info className="mr-2 h-5 w-5" /> Start Live Chat (Simulated)
          </Button>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground">Note: Chat functionalities are simulated for demo purposes and are not active.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
