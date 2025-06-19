
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Lightbulb, Users, Globe } from 'lucide-react';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-4">About Shed Load Overseas</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Your trusted partner in global logistics and courier services. We are dedicated to providing seamless, reliable, and efficient shipping solutions for businesses and individuals.
        </p>
      </section>

      <section className="grid md:grid-cols-1 gap-8 items-stretch">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="font-headline text-2xl sm:text-3xl text-primary flex items-center gap-2">
              <Briefcase className="h-8 w-8" /> Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-center items-start">
              <div className="lg:w-3/4 lg:pr-6">
                <p className="text-lg text-muted-foreground mb-4">
                  To connect the world through efficient and innovative logistics. We strive to simplify shipping, making it accessible and dependable for everyone, everywhere. Our commitment is to deliver not just packages, but also peace of mind.
                </p>
                <p className="text-muted-foreground">
                  We leverage technology and a dedicated team to ensure your shipments are handled with utmost care and precision, from booking to final delivery.
                </p>
              </div>
              <div className="lg:w-1/4 mt-6 lg:mt-0 flex items-center justify-center w-full">
                <Image
                  src="/images/mission.png"
                  alt="Illustration of a compass symbolizing our mission"
                  width={200}
                  height={150}
                  className="object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
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
            <h3 className="font-headline text-lg sm:text-xl font-semibold mb-2">{value.title}</h3>
            <p className="text-muted-foreground text-sm">{value.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

