
"use client";

import { useState, useEffect } from 'react'; 
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { CalendarIcon, Package, User, ArrowRight, CheckCircle, PackagePlus, IndianRupee, ScanLine, Globe, Home, Loader2 } from 'lucide-react';
import { useShipments } from '@/hooks/use-shipments';
import type { ServiceType, CreateShipmentResponse, ShipmentTypeOption, DomesticPriceRequest, DomesticPriceResponse, InternationalPriceRequest, InternationalPriceResponse, PriceApiResponse } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; 
import { indianStatesAndUTs } from '@/lib/indian-states';
import { internationalCountryList } from '@/lib/country-list';
import apiClient from '@/lib/api-client';

// Adjusted schema: some fields made optional, will be validated conditionally or by API.
const shipmentFormSchema = z.object({
  shipmentTypeOption: z.enum(["Domestic", "International"], { required_error: "Please select shipment type." }),
  
  senderName: z.string().min(2, "Sender name is required"),
  senderAddressStreet: z.string().min(5, "Street address is required (min 5 chars)"),
  senderAddressCity: z.string().min(2, "City is required"),
  senderAddressState: z.string().min(2, "State is required"), // For sender, state is always required
  senderAddressPincode: z.string().regex(/^\d{5,6}$/, "Pincode must be 5 or 6 digits"),
  senderAddressCountry: z.string().min(2, "Country is required").default("India"),
  senderPhone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid Indian phone number (e.g., +919876543210 or 9876543210)"),

  receiverName: z.string().min(2, "Receiver name is required"),
  receiverAddressStreet: z.string().min(5, "Street address is required (min 5 chars)"),
  receiverAddressCity: z.string().min(2, "City is required"),
  receiverAddressState: z.string().optional(), // Optional for international, required for domestic
  receiverAddressPincode: z.string().regex(/^\d{3,10}$/, "Pincode/ZIP must be 3-10 digits"), // Adjusted for ZIP and international
  receiverAddressCountry: z.string().min(2, "Country is required"), // Required for International
  receiverPhone: z.string().regex(/^(\+?[1-9]\d{1,14})?$/, "Invalid phone number format"), // More generic for intl.

  packageWeightKg: z.coerce.number().min(0.1, "Weight must be at least 0.1kg").max(100, "Max 100kg"),
  packageWidthCm: z.coerce.number().min(1, "Width must be at least 1cm").max(200, "Max 200cm"),
  packageHeightCm: z.coerce.number().min(1, "Height must be at least 1cm").max(200, "Max 200cm"),
  packageLengthCm: z.coerce.number().min(1, "Length must be at least 1cm").max(200, "Max 200cm"),
  
  pickupDate: z.date({ required_error: "Pickup date is required." }),
  serviceType: z.enum(["Standard", "Express"]).optional(), // Optional for International (always Express)
});

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

interface PaymentStepData {
  show: boolean;
  amount: string; // Store formatted amount string
  priceResponse: PriceApiResponse | null;
  formData: ShipmentFormValues | null;
  shipmentType: ShipmentTypeOption | null;
}


export function BookShipmentForm() {
  const [submissionStatus, setSubmissionStatus] = useState<CreateShipmentResponse | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStepData>({ show: false, amount: "0.00", priceResponse: null, formData: null, shipmentType: null });
  const { addShipment, isLoading: isShipmentContextLoading } = useShipments();
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); 

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      shipmentTypeOption: undefined, // User must select
      senderName: '', 
      senderAddressStreet: '', senderAddressCity: '', senderAddressState: '', senderAddressPincode: '', senderAddressCountry: 'India',
      senderPhone: '',
      receiverName: '',
      receiverAddressStreet: '', receiverAddressCity: '', receiverAddressPincode: '',
      // receiverAddressState and receiverAddressCountry will be set based on shipmentTypeOption
      receiverPhone: '',
      packageWeightKg: 0.5,
      packageWidthCm: 10,
      packageHeightCm: 10,
      packageLengthCm: 10,
      // serviceType default will be set based on shipmentTypeOption
      pickupDate: new Date(new Date().setDate(new Date().getDate() + 1)) 
    },
  });

  const shipmentTypeOption = form.watch("shipmentTypeOption");

  useEffect(() => {
    if (user && user.firstName && user.lastName) {
      form.setValue('senderName', `${user.firstName} ${user.lastName}`);
    }
  }, [user, form]);

  useEffect(() => {
    // Reset conditional fields when shipment type changes
    form.resetField("receiverAddressState");
    form.resetField("receiverAddressCountry");
    form.resetField("serviceType");
    form.clearErrors(["receiverAddressState", "receiverAddressCountry", "serviceType"]); // Clear potential errors

    if (shipmentTypeOption === "Domestic") {
      form.setValue("receiverAddressCountry", "India");
      form.setValue("serviceType", "Standard");
      form.setValue("receiverAddressPincode", ""); // Clear pincode for domestic entry
    } else if (shipmentTypeOption === "International") {
      form.setValue("serviceType", "Express"); // International is always Express
      form.setValue("receiverAddressCountry", ""); // Clear for user input
      form.setValue("receiverAddressPincode", ""); // Clear pincode for international entry
    }
  }, [shipmentTypeOption, form]);


  const onSubmitToPayment = async (data: ShipmentFormValues) => {
    setIsPricingLoading(true);
    setPaymentStep({ show: false, amount: "0.00", priceResponse: null, formData: null, shipmentType: null }); // Reset previous

    try {
      let priceResponseData: PriceApiResponse;
      let displayAmount = "Error";

      if (data.shipmentTypeOption === "Domestic") {
        if (!data.receiverAddressState) {
          form.setError("receiverAddressState", { type: "manual", message: "Receiver state is required for domestic."});
          setIsPricingLoading(false);
          return;
        }
        if (!data.serviceType) {
          form.setError("serviceType", {type: "manual", message: "Service type is required for domestic."});
          setIsPricingLoading(false);
          return;
        }
        const domesticPayload: DomesticPriceRequest = {
          state: data.receiverAddressState,
          mode: data.serviceType.toLowerCase() as "express" | "standard",
          weight: data.packageWeightKg,
        };
        priceResponseData = await apiClient<DomesticPriceResponse>('/domestic/price', {
          method: 'POST',
          body: JSON.stringify(domesticPayload),
        });
        if (priceResponseData.error) throw new Error(priceResponseData.error);
        displayAmount = (priceResponseData as DomesticPriceResponse).total_price;

      } else if (data.shipmentTypeOption === "International") {
         if (!data.receiverAddressCountry || data.receiverAddressCountry === "India") {
          form.setError("receiverAddressCountry", { type: "manual", message: "A non-Indian country is required for international."});
          setIsPricingLoading(false);
          return;
        }
        const internationalPayload: InternationalPriceRequest = {
          country: data.receiverAddressCountry,
          weight: data.packageWeightKg,
        };
        priceResponseData = await apiClient<InternationalPriceResponse>('/international/price', {
          method: 'POST',
          body: JSON.stringify(internationalPayload),
        });
        if (priceResponseData.error) throw new Error(priceResponseData.error);
        displayAmount = (priceResponseData as InternationalPriceResponse).formatted_total || `₹${(priceResponseData as InternationalPriceResponse).total_price.toFixed(2)}`;
      } else {
        throw new Error("Invalid shipment type selected.");
      }
      
      setPaymentStep({ show: true, amount: displayAmount, priceResponse: priceResponseData, formData: data, shipmentType: data.shipmentTypeOption });

    } catch (error: any) {
      const errorMessage = error?.data?.error || error.message || "Failed to fetch pricing.";
      toast({
        title: "Pricing Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPricingLoading(false);
    }
  };

  const handleConfirmPaymentAndBook = async () => {
    if (!paymentStep.formData || !paymentStep.shipmentType || !paymentStep.priceResponse) return;

    const data = paymentStep.formData;
    const formattedPickupDate = format(data.pickupDate, "yyyy-MM-dd");

    // This should match the POST /api/shipments backend expectation
    const apiShipmentData = {
        sender_name: data.senderName,
        sender_address_street: data.senderAddressStreet,
        sender_address_city: data.senderAddressCity,
        sender_address_state: data.senderAddressState, // Sender state always present
        sender_address_pincode: data.senderAddressPincode,
        sender_address_country: data.senderAddressCountry, // Default "India"
        sender_phone: data.senderPhone,
        
        receiver_name: data.receiverName,
        receiver_address_street: data.receiverAddressStreet,
        receiver_address_city: data.receiverAddressCity,
        receiver_address_state: data.shipmentTypeOption === "Domestic" ? data.receiverAddressState || "" : data.receiverAddressState || "", // Send if present
        receiver_address_pincode: data.receiverAddressPincode,
        receiver_address_country: data.shipmentTypeOption === "Domestic" ? "India" : data.receiverAddressCountry,
        receiver_phone: data.receiverPhone,
        
        package_weight_kg: data.packageWeightKg,
        package_width_cm: data.packageWidthCm,
        package_height_cm: data.packageHeightCm,
        package_length_cm: data.packageLengthCm,
        
        pickup_date: formattedPickupDate,
        service_type: data.shipmentTypeOption === "Domestic" ? (data.serviceType as ServiceType) : "Express", // Intl is Express
    };

    try {
        const response = await addShipment(apiShipmentData as any); 
        setSubmissionStatus(response); 
        toast({
            title: "Shipment Booked!",
            description: `Your shipment ID is ${response.shipment_id_str}.`,
        });
        form.reset({ 
            shipmentTypeOption: undefined,
            senderName: (user && user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : '',
            senderAddressStreet: '', senderAddressCity: '', senderAddressState: '', senderAddressPincode: '', senderAddressCountry: 'India',
            senderPhone: '',
            receiverName: '',
            receiverAddressStreet: '', receiverAddressCity: '', receiverAddressPincode: '',
            receiverPhone: '',
            packageWeightKg: 0.5,
            packageWidthCm: 10,
            packageHeightCm: 10,
            packageLengthCm: 10,
            pickupDate: new Date(new Date().setDate(new Date().getDate() + 1))
        });
        setPaymentStep({ show: false, amount: "0.00", priceResponse: null, formData: null, shipmentType: null });
    } catch (error: any) {
        const errorMessage = error?.data?.error || error?.message || "Failed to book shipment.";
        toast({
            title: "Booking Failed",
            description: errorMessage,
            variant: "destructive",
        });
         setPaymentStep({ ...paymentStep, show: false }); // Keep data for retry if needed, just hide
    }
  };

  if (submissionStatus) {
    const totalPaid = submissionStatus.data?.total_with_tax_18_percent;
    return (
      <Alert className="border-green-500 bg-green-50 text-green-700">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="font-headline text-green-700">Shipment Confirmed!</AlertTitle>
        <AlertDescription>
          <p>{submissionStatus.message}</p>
          <p>Shipment ID: <strong>{submissionStatus.shipment_id_str}</strong></p>
          <p>Total Paid: <IndianRupee className="inline h-4 w-4" /> 
            {(typeof totalPaid === 'number' ? totalPaid.toFixed(2) : 'N/A')}
          </p>
          <div className="mt-4 space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
            <Button onClick={() => { setSubmissionStatus(null); form.setValue("shipmentTypeOption", undefined);}} className="w-full sm:w-auto" variant="outline">
              Book Another Shipment
            </Button>
            <Button asChild className="w-full sm:w-auto" variant="default" disabled={!submissionStatus.shipment_id_str}>
              <a href={submissionStatus.shipment_id_str ? `/dashboard/invoice/${submissionStatus.shipment_id_str}`: '#'} target="_blank" rel="noopener noreferrer">View Invoice</a>
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
          <CardDescription>Review details and scan QR to pay (simulation).</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-muted-foreground">Amount to Pay:</p>
            <p className="text-3xl font-bold text-primary flex items-center justify-center">
              {paymentStep.amount.includes("₹") ? paymentStep.amount : `₹${paymentStep.amount}`}
            </p>
            {paymentStep.shipmentType === "International" && (paymentStep.priceResponse as InternationalPriceResponse)?.zone && (
              <p className="text-sm text-muted-foreground mt-1">Zone: {(paymentStep.priceResponse as InternationalPriceResponse).zone}</p>
            )}
             {paymentStep.shipmentType === "Domestic" && (paymentStep.priceResponse as DomesticPriceResponse)?.price_per_kg && (
              <p className="text-sm text-muted-foreground mt-1">Rate: {(paymentStep.priceResponse as DomesticPriceResponse).price_per_kg} (Rounded Weight: {(paymentStep.priceResponse as DomesticPriceResponse).rounded_weight}kg)</p>
            )}
          </div>
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/256x256.png?text=Scan+UPI+QR"
              alt="UPI QR Code Placeholder"
              width={200}
              height={200}
              className="rounded-md border shadow-sm"
              data-ai-hint="payment gateway"
            />
          </div>
          <p className="text-xs text-muted-foreground">This is a dummy payment page. No actual payment will be processed. Click below to confirm booking.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleConfirmPaymentAndBook} className="w-full text-lg py-3" disabled={isShipmentContextLoading || isPricingLoading}>
            {(isShipmentContextLoading || isPricingLoading) ? "Processing..." : "Confirm Booking (Simulate Payment)"}
          </Button>
          <Button variant="outline" onClick={() => setPaymentStep({ ...paymentStep, show: false })} className="w-full" disabled={isShipmentContextLoading || isPricingLoading}>
            Back to Form
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
        <CardDescription>Select shipment type and fill details to schedule your shipment.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitToPayment)} className="space-y-8">
            <FormField
              control={form.control}
              name="shipmentTypeOption"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Select Shipment Type:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:border-primary transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="Domestic" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                          <Home className="h-5 w-5 text-primary" /> Domestic
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:border-primary transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="International" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                          <Globe className="h-5 w-5 text-primary" /> International
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {shipmentTypeOption && (
              <>
                {/* Sender Details */}
                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                    <User className="h-5 w-5" /> Sender Details
                  </h3>
                  <FormField control={form.control} name="senderName" render={({ field }) => ( <FormItem><FormLabel>Sender Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="senderAddressStreet" render={({ field }) => ( <FormItem><FormLabel>Street Address / Building</FormLabel><FormControl><Input placeholder="123 Main St, Apt 4B" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="senderAddressCity" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Mumbai" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="senderAddressState" render={({ field }) => ( <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="Maharashtra" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="senderAddressPincode" render={({ field }) => ( <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="400001" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="senderAddressCountry" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="India" {...field} disabled={true} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <FormField control={form.control} name="senderPhone" render={({ field }) => ( <FormItem><FormLabel>Sender Phone</FormLabel><FormControl><Input type="tel" placeholder="+919876543210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </section>

                {/* Receiver Details */}
                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                    <User className="h-5 w-5" /> Receiver Details
                  </h3>
                  <FormField control={form.control} name="receiverName" render={({ field }) => ( <FormItem><FormLabel>Receiver Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="receiverAddressStreet" render={({ field }) => ( <FormItem><FormLabel>Street Address / Building</FormLabel><FormControl><Input placeholder="456 Market St, Tower C" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="receiverAddressCity" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Receiver City" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    {shipmentTypeOption === "Domestic" ? (
                      <FormField control={form.control} name="receiverAddressState" render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {indianStatesAndUTs.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ) : ( // International
                      <FormField control={form.control} name="receiverAddressState" render={({ field }) => ( <FormItem><FormLabel>State / Province (Optional)</FormLabel><FormControl><Input placeholder="e.g., California" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="receiverAddressPincode" render={({ field }) => ( <FormItem><FormLabel>Pincode / ZIP Code</FormLabel><FormControl><Input placeholder="110001 or 90210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    {shipmentTypeOption === "International" ? (
                       <FormField control={form.control} name="receiverAddressCountry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {internationalCountryList.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ) : (
                       <FormField control={form.control} name="receiverAddressCountry" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="India" {...field} disabled={true} /></FormControl><FormMessage /></FormItem> )} />
                    )}
                  </div>
                  <FormField control={form.control} name="receiverPhone" render={({ field }) => ( <FormItem><FormLabel>Receiver Phone</FormLabel><FormControl><Input type="tel" placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </section>

                {/* Package Details */}
                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary"> <Package className="h-5 w-5" /> Package Details </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField control={form.control} name="packageWeightKg" render={({ field }) => ( <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="packageLengthCm" render={({ field }) => ( <FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="packageWidthCm" render={({ field }) => ( <FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 20" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="packageHeightCm" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 15" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                </section>
                
                {/* Pickup & Service */}
                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary"> <CalendarIcon className="h-5 w-5" /> Pickup & Service </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="pickupDate" render={({ field }) => (
                        <FormItem className="flex flex-col"> <FormLabel>Pickup Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}>
                                  {field.value && isValid(field.value) ? ( format(field.value, "PPP")  ) : ( <span>Pick a date</span> )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date < new Date("1900-01-01")} initialFocus />
                            </PopoverContent>
                          </Popover> <FormMessage />
                        </FormItem>
                      )}
                    />
                    {shipmentTypeOption === "Domestic" ? (
                      <FormField control={form.control} name="serviceType" render={({ field }) => (
                        <FormItem> <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger></FormControl>
                            <SelectContent> <SelectItem value="Standard">Standard</SelectItem> <SelectItem value="Express">Express</SelectItem> </SelectContent>
                          </Select> <FormMessage />
                        </FormItem>
                      )} />
                    ) : (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <FormControl><Input value="Express (International)" disabled /></FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  </div>
                </section>

                <CardFooter className="p-0 pt-8">
                  <Button type="submit" className="w-full md:w-auto text-lg py-3 px-8 bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting || isPricingLoading || isShipmentContextLoading}>
                    {(form.formState.isSubmitting || isPricingLoading || isShipmentContextLoading) ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : 'Proceed to Payment'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

