
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, ArrowRight, AlertTriangle, Info } from 'lucide-react';
import { ShipmentStatusIndicator } from './shipment-status-indicator';
import type { TrackingStep, TrackingStage, Shipment } from '@/lib/types';
import { useShipments } from '@/hooks/use-shipments';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const trackSchema = z.object({
  shipmentId: z.string().min(3, "Shipment ID is required").regex(/^RS\d{6}$/, "Invalid Shipment ID format (e.g., RS123456)"),
});

type TrackFormValues = z.infer<typeof trackSchema>;

const generateFakeTrackingHistory = (shipmentStatus: TrackingStage, bookingDate: Date): TrackingStep[] => {
  const history: TrackingStep[] = [];
  const now = new Date();

  const addStep = (stage: TrackingStage, activity: string, location: string, daysOffset: number, isCurrent: boolean = false, isCompleted: boolean = true) => {
    const stepDate = new Date(bookingDate);
    stepDate.setDate(bookingDate.getDate() + daysOffset);
    if (stepDate > now && !(isCurrent && stage !== "Delivered")) return;


    history.push({
      stage,
      date: stepDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      activity,
      location,
      status: isCurrent ? "current" : (isCompleted ? "completed" : "pending"),
    });
  };
  
  const locations = ["Mumbai, MH", "Nagpur, MH", "Hyderabad, TS", "Bengaluru, KA", "Chennai, TN", "Delhi, DL"];
  const getRandomLocation = () => locations[Math.floor(Math.random() * locations.length)];

  addStep("Booked", "Shipment booked and confirmed", getRandomLocation(), 0, shipmentStatus === "Booked");

  if (shipmentStatus === "In Transit" || shipmentStatus === "Out for Delivery" || shipmentStatus === "Delivered") {
    addStep("In Transit", "Package departed from origin facility", getRandomLocation(), 1, shipmentStatus === "In Transit");
    addStep("In Transit", "Package arrived at sorting hub", getRandomLocation(), 2, shipmentStatus === "In Transit" && history.filter(s => s.stage === "In Transit").length < 2);
  }
  
  if (shipmentStatus === "Out for Delivery" || shipmentStatus === "Delivered") {
    addStep("In Transit", "Package departed from sorting hub", getRandomLocation(), 3, false);
    addStep("Out for Delivery", "Package out for delivery", getRandomLocation(), 4, shipmentStatus === "Out for Delivery");
  }
  
  if (shipmentStatus === "Delivered") {
    addStep("Delivered", "Package delivered successfully", getRandomLocation(), 5, shipmentStatus === "Delivered");
  }

  if (shipmentStatus === "Cancelled") {
     history.length = 0;
     addStep("Cancelled", "Shipment has been cancelled", getRandomLocation(), 1, true);
  }
  
  const currentStepIndex = history.findIndex(step => step.stage === shipmentStatus && step.status !== "completed");
  if(currentStepIndex !== -1) {
    history.forEach((step, idx) => {
      if (idx < currentStepIndex) step.status = "completed";
      else if (idx === currentStepIndex) step.status = "current";
      else step.status = "pending";
    });
  } else if (shipmentStatus === "Delivered" && history.length > 0) {
     history.forEach(step => step.status = "completed");
  }


  return history.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};


export function TrackShipmentForm() {
  const [trackingResult, setTrackingResult] = useState<{ shipment: Shipment, history: TrackingStep[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getShipmentById } = useShipments();

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      shipmentId: '',
    },
  });

  const onSubmit = (data: TrackFormValues) => {
    setError(null);
    setTrackingResult(null);
    
    const shipment = getShipmentById(data.shipmentId);

    if (shipment) {
      const shipmentHistory = generateFakeTrackingHistory(shipment.status, shipment.bookingDate);
      setTrackingResult({ shipment, history: shipmentHistory });
    } else {
      // Generate a random status for unbooked IDs for user experience.
      const randomStatuses: TrackingStage[] = ["Booked", "In Transit", "Out for Delivery", "Delivered", "Cancelled"];
      const randomStatus = randomStatuses[Math.floor(Math.random() * randomStatuses.length)];
      const placeholderShipment : Shipment = {
        id: data.shipmentId,
        senderName: "System Data", // Changed from "Demo Sender"
        senderAddress: "System Data",
        senderPhone: "N/A",
        receiverName: "System Data", // Changed from "Demo Receiver"
        receiverAddress: "System Data",
        receiverPhone: "N/A",
        packageWeight: 1, packageWidth:10, packageHeight:10, packageLength:10,
        pickupDate: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 5) -1)), 
        serviceType: "Standard",
        bookingDate: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 5) -1)),
        status: randomStatus,
      };
      const placeholderHistory = generateFakeTrackingHistory(randomStatus, placeholderShipment.bookingDate);
      setTrackingResult({ shipment: placeholderShipment, history: placeholderHistory });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Search className="h-8 w-8 text-primary" /> Track Your Shipment
          </CardTitle>
          <CardDescription>Enter your shipment ID to see its current status and history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
              <FormField
                control={form.control}
                name="shipmentId"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Shipment ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Shipment ID (e.g., RS123456)" {...field} className="text-base py-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto text-lg py-3 px-6 bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Tracking...' : 'Track'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {trackingResult && (
        <div className="mt-8 max-w-2xl mx-auto">
          <ShipmentStatusIndicator
            shipmentId={trackingResult.shipment.id}
            currentStatus={trackingResult.shipment.status}
            trackingHistory={trackingResult.history}
          />
        </div>
      )}
    </div>
  );
}
