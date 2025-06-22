
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RefundPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <CircleDollarSign className="h-8 w-8 text-primary" /> Refund & Cancellation Policy
          </CardTitle>
          {lastUpdated && <CardDescription>Last updated: {lastUpdated}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>This policy outlines the procedures for cancellations and refunds for services provided by SHEDLOAD OVERSEAS LLP.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">1. Order Cancellation</h2>
          <p>You may cancel a shipment booking under the following conditions:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Before Pickup:</strong> You can cancel a shipment at any time before it has been picked up by our courier partner. To do so, please contact our customer support with your Shipment ID. A full refund will be issued.</li>
            <li><strong>After Pickup:</strong> Once a shipment has been picked up, it cannot be cancelled. However, if you need to request a return-to-origin, please contact our support team. Additional charges may apply.</li>
          </ul>
          <p>SHEDLOAD OVERSEAS LLP reserves the right to cancel any shipment for reasons including, but not limited to, non-availability of service to a destination, prohibited items in the package, or incorrect information provided by the user.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. Refund Policy</h2>
          <p>Refunds will be processed in the following situations:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>For orders that were successfully cancelled before pickup.</li>
            <li>In the event of a service failure from our end, such as a confirmed lost package (after investigation).</li>
            <li>If a duplicate payment was accidentally made for a single shipment.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. Non-Refundable Situations</h2>
          <p>Refunds will not be provided in the following cases:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Delays in delivery caused by factors beyond our control, such as customs clearance, weather conditions, or local disruptions in the destination area.</li>
            <li>Shipments that are refused by the recipient.</li>
            <li>Shipments that are returned due to an incorrect or incomplete address provided by the sender.</li>
            <li>Shipments containing prohibited items.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. Refund Process</h2>
          <p>Once a refund is approved, it will be processed within <strong>5-7 business days</strong>. The refund amount will be credited back to the original mode of payment used during the booking.</p>
          <p>You will be notified via email once the refund has been processed from our end. Please note that it may take additional time for the amount to reflect in your account, depending on your bank or payment provider.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Contact Us</h2>
          <p>For any questions regarding cancellations or refunds, please contact our customer support team at SHEDLOADOVERSEAS@GMAIL.COM with your Shipment ID and query details.</p>
        </CardContent>
      </Card>
    </div>
  );
}
