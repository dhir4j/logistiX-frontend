
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Lightbulb, Users, Globe } from 'lucide-react';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">About Shed Load Overseas</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your trusted partner in global logistics and courier services. We are dedicated to providing seamless, reliable, and efficient shipping solutions for businesses and individuals.
        </p>
      </section>

      <section>
        <Card className="shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
                  <Briefcase className="h-8 w-8" /> Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-lg text-muted-foreground mb-4">
                  To connect the world through efficient and innovative logistics. We strive to simplify shipping, making it accessible and dependable for everyone, everywhere. Our commitment is to deliver not just packages, but also peace of mind.
                </p>
                <p className="text-muted-foreground">
                  We leverage technology and a dedicated team to ensure your shipments are handled with utmost care and precision, from booking to final delivery.
                </p>
              </CardContent>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/images/mission.png"
                alt="Illustration or photo representing our company mission"
                width={600}
                height={450}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        {[
          { icon: Lightbulb, title: "Innovation", description: "Constantly seeking new ways to improve our services and astreamline your shipping experience." , dataAiHint: "bright idea"},
          { icon: Users, title: "Customer Focus", description: "Our customers are at the heart of everything we do. We tailor solutions to meet your unique needs." , dataAiHint: "happy customer"},
          { icon: Globe, title: "Global Reach", description: "With an extensive network, we connect you to destinations across India and internationally." , dataAiHint: "global network"},
        ].map(value => (
          <Card key={value.title} className="shadow-md p-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full inline-block border border-primary/20">
                <value.icon className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h3 className="font-headline text-xl font-semibold mb-2">{value.title}</h3>
            <p className="text-muted-foreground text-sm">{value.description}</p>
          </Card>
        ))}
      </section>
      
      <section className="text-center">
         <Card className="shadow-lg p-8 bg-muted/30">
            <CardTitle className="font-headline text-2xl mb-4">RS SWIFT COURIERS LLP</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
                Shed Load Overseas is a premier service brand under RS SWIFT COURIERS LLP. We combine local expertise with a global outlook to provide top-tier courier and cargo solutions.
            </CardDescription>
        </Card>
      </section>
    </div>
  );
}
