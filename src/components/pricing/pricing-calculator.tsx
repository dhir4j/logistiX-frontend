
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calculator, ArrowRight, MapPin, Weight, IndianRupee } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const pricingSchema = z.object({
  fromPincode: z.string().regex(/^\d{6}$/, "Invalid 'From' Pincode (must be 6 digits)"),
  toPincode: z.string().regex(/^\d{6}$/, "Invalid 'To' Pincode (must be 6 digits)"),
  weight: z.coerce.number().min(0.1, "Weight must be at least 0.1kg").max(100, "Weight cannot exceed 100kg"),
});

type PricingFormValues = z.infer<typeof pricingSchema>;

const RATE_PER_HALF_KG = 45; // ₹45 per 0.5 kg
const BASE_CHARGE = 20; // A small base charge

export function PricingCalculator() {
  const [calculatedCharge, setCalculatedCharge] = useState<number | null>(null);

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      fromPincode: '',
      toPincode: '',
      weight: 0.5,
    },
  });

  const onSubmit = (data: PricingFormValues) => {
    // Fake calculation: ₹45 per 0.5 kg means ₹90 per kg
    // If weight is 0.3kg, it counts as 0.5kg. If 0.7kg, counts as 1kg (2 * 0.5kg)
    const weightInHalfKgs = Math.ceil(data.weight / 0.5);
    const charge = BASE_CHARGE + (weightInHalfKgs * RATE_PER_HALF_KG);
    setCalculatedCharge(charge);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
          <Calculator className="h-8 w-8 text-primary" /> Pricing Calculator
        </CardTitle>
        <CardDescription>Estimate your shipment costs quickly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fromPincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> From Pincode</FormLabel>
                  <FormControl><Input placeholder="Enter 6-digit Pincode" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toPincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> To Pincode</FormLabel>
                  <FormControl><Input placeholder="Enter 6-digit Pincode" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Weight className="h-4 w-4 text-muted-foreground" /> Weight (kg)</FormLabel>
                  <FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-3 bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Calculating...' : 'Calculate Charge'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </Form>
      </CardContent>
      {calculatedCharge !== null && (
        <CardFooter className="mt-6">
          <Alert className="w-full border-primary/30 bg-primary/10">
            <IndianRupee className="h-5 w-5 text-primary" />
            <AlertTitle className="font-headline text-xl text-primary">Estimated Charge</AlertTitle>
            <AlertDescription className="text-2xl font-bold text-primary font-headline">
              <span className="inline-flex items-center">
                <IndianRupee className="h-6 w-6 mr-1 rtl:ml-1 rtl:mr-0" />
                {calculatedCharge.toFixed(2)}
              </span>
            </AlertDescription>
             <p className="text-xs text-muted-foreground mt-1">
              This is an estimated cost. Actual charges may vary. (Base: <span className="inline-flex items-center"><IndianRupee className="h-3 w-3 inline mr-0.5 rtl:ml-0.5 rtl:mr-0" />{BASE_CHARGE}</span>, Rate: <span className="inline-flex items-center"><IndianRupee className="h-3 w-3 inline mr-0.5 rtl:ml-0.5 rtl:mr-0" />{RATE_PER_HALF_KG}</span>/0.5kg)
            </p>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
}
