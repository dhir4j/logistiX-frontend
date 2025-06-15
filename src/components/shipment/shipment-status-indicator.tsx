
"use client";

import * as React from 'react';
import type { TrackingStep, TrackingStage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Loader2, Truck, PackageCheck, PackageSearch, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface ShipmentStatusIndicatorProps {
  shipmentId: string;
  currentStatus: TrackingStage;
  trackingHistory: TrackingStep[];
}

const stageIcons: Record<TrackingStage, React.ElementType> = {
  Booked: PackageSearch,
  "In Transit": Truck,
  "Out for Delivery": PackageCheck,
  Delivered: CheckCircle,
  Cancelled: AlertTriangle,
};

const stageOrder: TrackingStage[] = ["Booked", "In Transit", "Out for Delivery", "Delivered"];

export function ShipmentStatusIndicator({ shipmentId, currentStatus, trackingHistory }: ShipmentStatusIndicatorProps) {
  
  const currentStageIndex = stageOrder.indexOf(currentStatus);
  const progressValue = currentStatus === "Delivered" ? 100 : (currentStageIndex + 1) / stageOrder.length * 100;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl sm:text-2xl text-primary">
          Tracking ID: {shipmentId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            {stageOrder.map((stage, index) => (
              <div key={stage} className={`flex flex-col items-center text-xs font-medium ${index <= currentStageIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                {React.createElement(stageIcons[stage], { className: `h-6 w-6 mb-1` })}
                <span className="text-center">{stage}</span> {/* Added text-center for better mobile display if text wraps */}
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="w-full h-2" />
          {currentStatus === "Cancelled" && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">This shipment has been cancelled.</p>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h4 className="font-headline text-base sm:text-lg font-semibold mb-4">Shipment History</h4>
          {trackingHistory.length > 0 ? (
            <ul className="space-y-4">
              {trackingHistory.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : step.status === 'current' ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    {index < trackingHistory.length - 1 && (
                      <div className={`flex-grow w-px ${step.status === 'completed' ? 'bg-green-500' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`font-semibold ${step.status === 'current' ? 'text-primary' : ''}`}>{step.activity}</p>
                    <p className="text-sm text-muted-foreground">{step.date}</p>
                    <p className="text-sm text-muted-foreground">{step.location}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No tracking history available yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
