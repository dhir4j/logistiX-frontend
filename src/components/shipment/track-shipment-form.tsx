
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
import apiClient from '@/lib/api-client'; 
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // For logout on 422
import { mapApiShipmentToFrontend } from '@/contexts/shipment-context'; // Import mapper

const trackSchema = z.object({
  // Field name 'shipmentId' will hold the shipment_id_str for the form
  shipmentId: z.string().min(3, "Shipment ID is required").regex(/^RS\d{6}$/, "Invalid Shipment ID format (e.g., RS123456)"),
});

type TrackFormValues = z.infer<typeof trackSchema>;

const enrichTrackingHistory = (history: TrackingStep[] | undefined, currentApiStatus: TrackingStage): TrackingStep[] => {
  if (!history || history.length === 0) return [];

  // Ensure history is sorted by date ascending
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentStageReached = false;
  const enriched: TrackingStep[] = [];

  // Determine if the current status is a final one
  const isFinalStatus = currentApiStatus === "Delivered" || currentApiStatus === "Cancelled";

  for (const step of sortedHistory) {
    let newStatus: "completed" | "current" | "pending" = "pending";

    if (isFinalStatus) {
      // If the overall status is final, all steps related to reaching that status are 'completed'.
      // If the step's stage itself is "Cancelled", it's "current" only if currentApiStatus is "Cancelled".
      if (currentApiStatus === "Cancelled" && step.stage === "Cancelled") {
        newStatus = "current";
      } else if (currentApiStatus === "Cancelled" && step.stage !== "Cancelled") {
        newStatus = "completed"; // Steps before cancellation are completed
      }
      else { // Delivered
         newStatus = "completed";
      }
    } else {
      // For non-final statuses
      if (step.stage === currentApiStatus && !currentStageReached) {
        newStatus = "current";
        currentStageReached = true; // Mark that we've found the 'current' step for this stage
      } else if (currentStageReached) {
        // Any step after the 'current' one (for the same stage or subsequent stages) should be 'pending'
        // unless it's an older stage that got re-processed (unlikely in typical linear flow)
        const stageOrder: TrackingStage[] = ["Booked", "In Transit", "Out for Delivery", "Delivered"];
        if (stageOrder.indexOf(step.stage) < stageOrder.indexOf(currentApiStatus)) {
             newStatus = "completed"; // Should have been completed if we are past it
        } else {
            newStatus = "pending";
        }

      } else { // currentStageReached is false, meaning we haven't found the current step yet
        // All steps for stages before the currentApiStatus should be 'completed'
        const stageOrder: TrackingStage[] = ["Booked", "In Transit", "Out for Delivery", "Delivered"];
        if (stageOrder.indexOf(step.stage) < stageOrder.indexOf(currentApiStatus)) {
          newStatus = "completed";
        } else {
          newStatus = "pending"; // Steps for current or future stages are pending until current is found
        }
      }
    }
    enriched.push({ ...step, status: newStatus });
  }
  
  // If current stage wasn't found in history (e.g. status updated but no history entry yet for it),
  // mark the last known completed step as 'current' if its stage matches currentApiStatus.
  // This primarily handles cases where status is updated but tracking history might lag.
  if (!currentStageReached && !isFinalStatus) {
      const lastCompletedStep = enriched.slice().reverse().find(s => s.status === "completed" && s.stage === currentApiStatus);
      if (lastCompletedStep) {
          const index = enriched.findIndex(s => s.date === lastCompletedStep.date && s.activity === lastCompletedStep.activity);
          if (index > -1) enriched[index].status = "current";
      }
  }


  return enriched;
};


export function TrackShipmentForm() {
  const [trackingResult, setTrackingResult] = useState<Shipment | null>(null); // Mapped shipment
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { logoutUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      shipmentId: searchParams.get('id') || '', // This 'id' from URL is shipment_id_str
    },
  });

  const fetchShipmentDetails = async (shipment_id_str_to_fetch: string) => {
    if (!shipment_id_str_to_fetch || shipment_id_str_to_fetch === 'undefined') {
        toast({ title: "Invalid ID", description: "Cannot track shipment with an invalid ID.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setApiError(null);
    setTrackingResult(null);
    try {
      // API returns snake_case shipment
      const shipmentFromApi = await apiClient<any>(`/api/shipments/${shipment_id_str_to_fetch}`);
      // Map to frontend camelCase (or hybrid) Shipment object
      const mappedShipment = mapApiShipmentToFrontend(shipmentFromApi);
      // Enrich history client-side for UI display purposes
      const enrichedHistory = enrichTrackingHistory(mappedShipment.tracking_history, mappedShipment.status);
      setTrackingResult({...mappedShipment, tracking_history: enrichedHistory, trackingHistory: enrichedHistory });
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || "Failed to track shipment.";
      if (error.status === 422) {
        toast({
            title: "Authentication Issue",
            description: "Your session may have expired. Please log in again.",
            variant: "destructive",
        });
        logoutUser(); // Call logoutUser from useAuth
        router.replace('/login');
      } else {
        toast({
          title: "Tracking Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const shipmentIdFromUrl = searchParams.get('id'); // This is shipment_id_str
    if (shipmentIdFromUrl && trackSchema.safeParse({shipmentId: shipmentIdFromUrl}).success) {
      form.setValue('shipmentId', shipmentIdFromUrl); 
      fetchShipmentDetails(shipmentIdFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); 

  const onSubmit = (data: TrackFormValues) => {
    // data.shipmentId is the shipment_id_str from the form
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
                name="shipmentId" // This holds the shipment_id_str
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
            shipmentId={trackingResult.shipment_id_str} // Use shipment_id_str
            currentStatus={trackingResult.status}
            trackingHistory={trackingResult.tracking_history} // Use tracking_history
          />
        </div>
      )}
    </div>
  );
}
