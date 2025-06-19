
"use client";

import { useState, useEffect } from 'react'; // Added useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { CalendarIcon, Package, User, ArrowRight, CheckCircle, PackagePlus, IndianRupee, ScanLine } from 'lucide-react';
import { useShipments } from '@/hooks/use-shipments';
import type { ServiceType, CreateShipmentResponse } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // Added useAuth

// Consistent with types.ts for API call, but form will use camelCase
const shipmentFormSchema = z.object({
  senderName: z.string().min(2, "Sender name is required"),
  senderAddressStreet: z.string().min(5, "Street address is required (min 5 chars)"),
  senderAddressCity: z.string().min(2, "City is required"),
  senderAddressState: z.string().min(2, "State is required"),
  senderAddressPincode: z.string().regex(/^\d{5,6}$/, "Pincode must be 5 or 6 digits"),
  senderAddressCountry: z.string().min(2, "Country is required").default("India"),
  senderPhone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid Indian phone number (e.g., +919876543210 or 9876543210)"),

  receiverName: z.string().min(2, "Receiver name is required"),
  receiverAddressStreet: z.string().min(5, "Street address is required (min 5 chars)"),
  receiverAddressCity: z.string().min(2, "City is required"),
  receiverAddressState: z.string().min(2, "State is required"),
  receiverAddressPincode: z.string().regex(/^\d{5,6}$/, "Pincode must be 5 or 6 digits"),
  receiverAddressCountry: z.string().min(2, "Country is required").default("India"),
  receiverPhone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid Indian phone number"),
  
  packageWeightKg: z.coerce.number().min(0.1, "Weight must be at least 0.1kg").max(100, "Max 100kg"),
  packageWidthCm: z.coerce.number().min(1, "Width must be at least 1cm").max(200, "Max 200cm"),
  packageHeightCm: z.coerce.number().min(1, "Height must be at least 1cm").max(200, "Max 200cm"),
  packageLengthCm: z.coerce.number().min(1, "Length must be at least 1cm").max(200, "Max 200cm"),
  
  pickupDate: z.date({ required_error: "Pickup date is required." }),
  serviceType: z.enum(["Standard", "Express"], { required_error: "Service type is required." }),
});

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

// Dummy calculation, actual calculation is on backend. This is just for display.
const calculateFrontendDisplayCharge = (data: ShipmentFormValues): number => {
    const RATE_PER_HALF_KG = 45; 
    const BASE_CHARGE = 20; 
    const EXPRESS_FEE = 50;
    const TAX_RATE = 0.18;

    const weightKg = typeof data.packageWeightKg === 'number' && !isNaN(data.packageWeightKg) ? data.packageWeightKg : 0;

    const weightInHalfKgs = Math.ceil(weightKg / 0.5);
    let charge = BASE_CHARGE + (weightInHalfKgs * RATE_PER_HALF_KG);

    if (data.serviceType === "Express") {
      charge += EXPRESS_FEE;
    }
    
    if (isNaN(charge)) {
        charge = BASE_CHARGE; // Default to base charge if calculation intermediate fails
    }

    const taxAmount = charge * TAX_RATE;
    const totalCharge = charge + taxAmount;

    return isNaN(totalCharge) ? 0 : totalCharge; // Ensure a number is always returned
};


export function BookShipmentForm() {
  const [submissionStatus, setSubmissionStatus] = useState<CreateShipmentResponse | null>(null);
  const [paymentStep, setPaymentStep] = useState<{ show: boolean; amount: number; formData: ShipmentFormValues | null }>({ show: false, amount: 0, formData: null });
  const { addShipment, isLoading: isShipmentContextLoading } = useShipments();
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from auth context

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      senderName: '', // Will be set by useEffect
      senderAddressStreet: '', senderAddressCity: '', senderAddressState: '', senderAddressPincode: '', senderAddressCountry: 'India',
      senderPhone: '',
      receiverName: '',
      receiverAddressStreet: '', receiverAddressCity: '', receiverAddressState: '', receiverAddressPincode: '', receiverAddressCountry: 'India',
      receiverPhone: '',
      packageWeightKg: 0.5,
      packageWidthCm: 10,
      packageHeightCm: 10,
      packageLengthCm: 10,
      serviceType: "Standard",
      pickupDate: new Date(new Date().setDate(new Date().getDate() + 1)) // Default to tomorrow
    },
  });

  // Auto-fill sender name
  useEffect(() => {
    if (user && user.firstName && user.lastName) {
      form.setValue('senderName', `${user.firstName} ${user.lastName}`);
    }
  }, [user, form]);


  const onSubmitToPayment = (data: ShipmentFormValues) => {
    const displayCharge = calculateFrontendDisplayCharge(data);
    setPaymentStep({ show: true, amount: displayCharge, formData: data });
  };

  const handleConfirmPaymentAndBook = async () => {
    if (!paymentStep.formData) return;

    const data = paymentStep.formData;
    
    const formattedPickupDate = format(data.pickupDate, "yyyy-MM-dd");

    const apiShipmentData = {
        senderName: data.senderName,
        senderAddressStreet: data.senderAddressStreet,
        senderAddressCity: data.senderAddressCity,
        senderAddressState: data.senderAddressState,
        senderAddressPincode: data.senderAddressPincode,
        senderAddressCountry: data.senderAddressCountry,
        senderPhone: data.senderPhone,
        receiverName: data.receiverName,
        receiverAddressStreet: data.receiverAddressStreet,
        receiverAddressCity: data.receiverAddressCity,
        receiverAddressState: data.receiverAddressState,
        receiverAddressPincode: data.receiverAddressPincode,
        receiverAddressCountry: data.receiverAddressCountry,
        receiverPhone: data.receiverPhone,
        packageWeightKg: data.packageWeightKg,
        packageWidthCm: data.packageWidthCm,
        packageHeightCm: data.packageHeightCm,
        packageLengthCm: data.packageLengthCm,
        pickupDate: formattedPickupDate,
        serviceType: data.serviceType as ServiceType,
    };

    try {
        const response = await addShipment(apiShipmentData);
        setSubmissionStatus(response);
        toast({
            title: "Shipment Booked!",
            description: `Your shipment ID is ${response.shipmentIdStr}.`,
        });
        form.reset({ // Reset form with potentially new default senderName if user changed
            senderName: (user && user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : '',
            senderAddressStreet: '', senderAddressCity: '', senderAddressState: '', senderAddressPincode: '', senderAddressCountry: 'India',
            senderPhone: '',
            receiverName: '',
            receiverAddressStreet: '', receiverAddressCity: '', receiverAddressState: '', receiverAddressPincode: '', receiverAddressCountry: 'India',
            receiverPhone: '',
            packageWeightKg: 0.5,
            packageWidthCm: 10,
            packageHeightCm: 10,
            packageLengthCm: 10,
            serviceType: "Standard",
            pickupDate: new Date(new Date().setDate(new Date().getDate() + 1))
        });
        setPaymentStep({ show: false, amount: 0, formData: null });
    } catch (error: any) {
        const errorMessage = error?.data?.error || error?.message || "Failed to book shipment.";
        toast({
            title: "Booking Failed",
            description: errorMessage,
            variant: "destructive",
        });
         setPaymentStep({ show: false, amount: 0, formData: null }); 
    }
  };

  if (submissionStatus) {
    return (
      <Alert className="border-green-500 bg-green-50 text-green-700">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="font-headline text-green-700">Shipment Confirmed!</AlertTitle>
        <AlertDescription>
          <p>{submissionStatus.message}</p>
          <p>Shipment ID: <strong>{submissionStatus.shipmentIdStr}</strong></p>
          <p>Total Paid: <IndianRupee className="inline h-4 w-4" /> {(typeof submissionStatus.data.totalWithTax18Percent === 'number' ? submissionStatus.data.totalWithTax18Percent.toFixed(2) : 'N/A')}</p>
          <div className="mt-4 space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
            <Button onClick={() => setSubmissionStatus(null)} className="w-full sm:w-auto" variant="outline">
              Book Another Shipment
            </Button>
            <Button asChild className="w-full sm:w-auto" variant="default">
              <a href={`/dashboard/invoice/${submissionStatus.shipmentIdStr}`} target="_blank" rel="noopener noreferrer">View Invoice</a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (paymentStep.show && paymentStep.formData) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
            <ScanLine className="h-8 w-8 text-primary" /> Complete Your Payment
          </CardTitle>
          <CardDescription>Scan the QR code using any UPI app to pay.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-muted-foreground">Amount to Pay (Display Only):</p>
            <p className="text-3xl font-bold text-primary flex items-center justify-center">
              <IndianRupee className="h-7 w-7 mr-1" />
              {/* Ensure paymentStep.amount is a number before calling toFixed */}
              {typeof paymentStep.amount === 'number' ? paymentStep.amount.toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/256x256.png?text=Scan+UPI+QR"
              alt="UPI QR Code Placeholder"
              width={200}
              height={200}
              className="rounded-md border shadow-sm"
              data-ai-hint="upi payment"
            />
          </div>
          <p className="text-xs text-muted-foreground">This is a dummy payment page. No actual payment will be processed. Click below to confirm booking.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleConfirmPaymentAndBook} className="w-full text-lg py-3" disabled={isShipmentContextLoading}>
            {isShipmentContextLoading ? "Processing..." : "Confirm Booking (Simulate Payment)"}
          </Button>
          <Button variant="outline" onClick={() => setPaymentStep({ show: false, amount: 0, formData: null })} className="w-full" disabled={isShipmentContextLoading}>
            Cancel 
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
          <PackagePlus className="h-8 w-8 text-primary" /> Book a New Shipment
        </CardTitle>
        <CardDescription>Fill in the details below to schedule your shipment.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitToPayment)} className="space-y-8">
            {/* Sender Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-6">
                <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" /> Sender Details
                </h3>
                <FormField control={form.control} name="senderName" render={({ field }) => (
                  <FormItem><FormLabel>Sender Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="senderAddressStreet" render={({ field }) => (
                  <FormItem><FormLabel>Street Address / Building</FormLabel><FormControl><Input placeholder="123 Main St, Apt 4B" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="senderAddressCity" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Mumbai" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="senderAddressState" render={({ field }) => (
                    <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="senderAddressPincode" render={({ field }) => (
                    <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="400001" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="senderAddressCountry" render={({ field }) => (
                    <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="India" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="senderPhone" render={({ field }) => (
                  <FormItem><FormLabel>Sender Phone</FormLabel><FormControl><Input type="tel" placeholder="+919876543210" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </section>

              {/* Receiver Details */}
              <section className="space-y-6">
                <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" /> Receiver Details
                </h3>
                <FormField control={form.control} name="receiverName" render={({ field }) => (
                  <FormItem><FormLabel>Receiver Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="receiverAddressStreet" render={({ field }) => (
                  <FormItem><FormLabel>Street Address / Building</FormLabel><FormControl><Input placeholder="456 Market St, Tower C" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="receiverAddressCity" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Delhi" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="receiverAddressState" render={({ field }) => (
                    <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="Delhi" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="receiverAddressPincode" render={({ field }) => (
                    <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="110001" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="receiverAddressCountry" render={({ field }) => (
                    <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="India" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="receiverPhone" render={({ field }) => (
                  <FormItem><FormLabel>Receiver Phone</FormLabel><FormControl><Input type="tel" placeholder="+919123456789" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </section>
            </div>

            {/* Package Details */}
            <section className="space-y-6 pt-6 border-t">
              <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" /> Package Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="packageWeightKg" render={({ field }) => (
                  <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="packageLengthCm" render={({ field }) => (
                  <FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="packageWidthCm" render={({ field }) => (
                  <FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 20" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="packageHeightCm" render={({ field }) => (
                  <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 15" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </section>
            
            {/* Pickup & Service */}
            <section className="space-y-6 pt-6 border-t">
              <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                <CalendarIcon className="h-5 w-5" /> Pickup & Service
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="pickupDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pickup Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && isValid(field.value) ? (
                                format(field.value, "PPP") 
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="serviceType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            <CardFooter className="p-0 pt-8">
              <Button type="submit" className="w-full md:w-auto text-lg py-3 px-8 bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting || isShipmentContextLoading}>
                {(form.formState.isSubmitting || isShipmentContextLoading) ? 'Processing...' : 'Proceed to Payment'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

