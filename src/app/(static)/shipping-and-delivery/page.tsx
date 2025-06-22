
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ShippingPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" /> Shipping & Delivery Policy
          </CardTitle>
          {lastUpdated && <CardDescription>Last updated: {lastUpdated}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Thank you for choosing SHEDLOAD OVERSEAS LLP. This policy details our shipping and delivery procedures to ensure you are fully informed about how we handle your shipments.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">1. General Information</h2>
          <p>All orders are subject to product availability. We ship to destinations across India and internationally. Our services are handled by a network of trusted courier partners to ensure reliable and timely delivery.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">2. Processing and Pickup Time</h2>
          <p>Once you book a shipment, it is processed for pickup within 24-48 business hours. Our courier partner will arrive at the specified sender address for pickup. Please ensure your package is ready and properly packed.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. Estimated Delivery Times</h2>
          <p>Delivery times are estimates and commence from the date of shipping, rather than the date of booking. Delivery times are to be used as a guide only and are subject to the acceptance and approval of your shipment.</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Domestic (Metros):</strong> 2-4 business days</li>
            <li><strong>Domestic (Other Cities):</strong> 4-7 business days</li>
            <li><strong>International:</strong> 7-15 business days (subject to customs clearance)</li>
          </ul>
          <p>Please note, business days mean Monday to Friday, except holidays. We do not ship on Sundays.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. Shipment Tracking</h2>
          <p>Once your shipment is picked up, you will receive a tracking ID. You can use this ID on our "Track Shipment" page to monitor your package's journey in real-time. Tracking updates are also sent via Email and SMS.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Shipping Restrictions</h2>
          <p>We do not ship prohibited items as detailed in our Terms of Service. This includes hazardous materials, illegal substances, and other restricted goods. SHEDLOAD OVERSEAS LLP reserves the right to refuse any shipment that violates our policies or the law.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">6. Damaged Items in Transport</h2>
          <p>If there is any damage to the packaging on delivery, contact us immediately at SHEDLOADOVERSEAS@GMAIL.COM.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">7. Customs, Duties, and Taxes (International)</h2>
          <p>All international shipments may be subject to customs, duties, and taxes imposed by the destination country. The recipient of the shipment is the importer of record and is responsible for all such import fees.</p>
        </CardContent>
      </Card>
    </div>
  );
}
