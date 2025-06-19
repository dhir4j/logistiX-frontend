
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, ArrowRight, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { ShipmentStatusIndicator } from './shipment-status-indicator';
import type { TrackingStep, TrackingStage, Shipment } from '@/lib/types';
import apiClient from '@/lib/api-client'; // Use apiClient directly
import { useToast } from '@/hooks/use-toast';

const trackSchema = z.object({
  shipmentId: z.string().min(3, "Shipment ID is required").regex(/^RS\d{6}$/, "Invalid Shipment ID format (e.g., RS123456)"),
});

type TrackFormValues = z.infer<typeof trackSchema>;

// Function to enrich tracking history with frontend status for UI
const enrichTrackingHistory = (history: TrackingStep[], currentApiStatus: TrackingStage): TrackingStep[] => {
  if (!history || history.length === 0) return [];

  const stageOrder: TrackingStage[] = ["Booked", "In Transit", "Out for Delivery", "Delivered"];
  let currentStageReached = false;

  const enriched = history.map(step => ({ ...step })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (let i = enriched.length - 1; i >= 0; i--) {
    if (enriched[i].stage === currentApiStatus && !currentStageReached) {
      enriched[i].status = "current";
      currentStageReached = true;
    } else if (currentStageReached) {
      enriched[i].status = "completed";
    } else {
      // If currentApiStatus is, e.g., Delivered, all previous should be completed.
      // If currentApiStatus is "In Transit", and we haven't found it yet, steps might be pending or completed.
      // This logic might need refinement based on how API populates history vs current status.
      // For now, assume API history is chronological and reflects actual events.
      // A simpler approach: mark last item matching currentApiStatus as 'current', all before as 'completed'.
      const currentStageIndexInOrder = stageOrder.indexOf(currentApiStatus);
      const stepStageIndexInOrder = stageOrder.indexOf(enriched[i].stage);
      if (stepStageIndexInOrder < currentStageIndexInOrder) {
        enriched[i].status = "completed";
      } else {
         enriched[i].status = "pending"; // Default for future steps if not current
      }
    }
  }
   // Ensure the very last item that matches the overall status is 'current'
  const lastMatchingCurrent = enriched.slice().reverse().find(s => s.stage === currentApiStatus);
  if(lastMatchingCurrent) {
      enriched.forEach(s => {
          if (s.date === lastMatchingCurrent.date && s.activity === lastMatchingCurrent.activity) {
              s.status = "current";
          } else if (new Date(s.date) < new Date(lastMatchingCurrent.date)) {
              s.status = "completed";
          } else if (s.status !== "current") { // Don't overwrite if already set by other logic
            s.status = "pending";
          }
      });
  }


  if (currentApiStatus === "Delivered") {
    return enriched.map(s => ({ ...s, status: "completed" }));
  }
  if (currentApiStatus === "Cancelled") {
     return enriched.filter(s => s.stage === "Cancelled").map(s => ({...s, status: "current"}));
  }


  return enriched;
};


export function TrackShipmentForm() {
  const [trackingResult, setTrackingResult] = useState<Shipment | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      shipmentId: searchParams.get('id') || '',
    },
  });

  const fetchShipmentDetails = async (shipmentId: string) => {
    setIsLoading(true);
    setApiError(null);
    setTrackingResult(null);
    try {
      const shipment = await apiClient<Shipment>(`/api/shipments/${shipmentId}`);
      // Enrich history client-side for UI display purposes
      const enrichedHistory = enrichTrackingHistory(shipment.trackingHistory, shipment.status);
      setTrackingResult({...shipment, trackingHistory: enrichedHistory});
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || "Failed to track shipment.";
      setApiError(errorMessage);
      toast({
        title: "Tracking Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-fetch if ID is in URL
  useEffect(() => {
    const shipmentIdFromUrl = searchParams.get('id');
    if (shipmentIdFromUrl && trackSchema.safeParse({shipmentId: shipmentIdFromUrl}).success) {
      form.setValue('shipmentId', shipmentIdFromUrl); // Ensure form field is also updated
      fetchShipmentDetails(shipmentIdFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // form not included to avoid re-triggering on setValue

  const onSubmit = (data: TrackFormValues) => {
    // Update URL query param without full page reload
    router.push(`/dashboard/track-shipment?id=${data.shipmentId}`, { scroll: false });
    fetchShipmentDetails(data.shipmentId);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
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
                  <FormItem className="flex-grow w-full sm:w-auto">
                    <FormLabel className="sr-only">Shipment ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Shipment ID (e.g., RS123456)" {...field} className="text-base py-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto text-lg py-3 px-6 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Track'}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {apiError && !isLoading && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {trackingResult && !isLoading && (
        <div className="mt-8 max-w-2xl mx-auto">
          <ShipmentStatusIndicator
            shipmentId={trackingResult.shipmentIdStr}
            currentStatus={trackingResult.status}
            trackingHistory={trackingResult.trackingHistory}
          />
        </div>
      )}
    </div>
  );
}
