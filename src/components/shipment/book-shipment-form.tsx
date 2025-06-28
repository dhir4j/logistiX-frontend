
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon, Package, User, ArrowRight, CheckCircle, PackagePlus, ScanLine, Globe, Home, Loader2, Edit3, Info, Wallet } from 'lucide-react';
import { useShipments } from '@/hooks/use-shipments';
import type { ServiceType, CreateShipmentResponse, ShipmentTypeOption, DomesticPriceRequest, DomesticPriceResponse, InternationalPriceRequest, InternationalPriceResponse, PriceApiResponse, AddShipmentPayload, SubmitUtrPayload, SubmitUtrResponse } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { indianStatesAndUTs } from '@/lib/indian-states';
import { internationalCountryList } from '@/lib/country-list';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

const shipmentFormSchema = z.object({
  shipmentTypeOption: z.enum(["Domestic", "International"], { required_error: "Please select shipment type." }),

  senderName: z.string().min(2, "Sender name is required"),
  senderAddressLine1: z.string().min(5, "Address Line 1 is required (min 5 chars)"),
  senderAddressLine2: z.string().optional(),
  senderAddressCity: z.string().min(2, "City is required"),
  senderAddressState: z.string().min(2, "State is required"),
  senderAddressPincode: z.string().regex(/^\d{5,6}$/, "Pincode must be 5 or 6 digits"),
  senderAddressCountry: z.string().min(2, "Country is required").default("India"),
  senderPhone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid Indian phone number (e.g., +919876543210 or 9876543210)"),

  receiverName: z.string().min(2, "Receiver name is required"),
  receiverAddressLine1: z.string().min(5, "Address Line 1 is required (min 5 chars)"),
  receiverAddressLine2: z.string().optional(),
  receiverAddressCity: z.string().min(2, "City is required"),
  receiverAddressState: z.string().min(2, "State/Province is required"),
  receiverAddressPincode: z.string().regex(/^\d{3,10}$/, "Pincode/ZIP must be 3-10 digits"),
  receiverAddressCountry: z.string().min(2, "Country is required"),
  receiverPhone: z.string().regex(/^(\+?[1-9]\d{1,14})?$/, "Invalid phone number format"),

  packageWeightKg: z.coerce.number().min(0.1, "Weight must be at least 0.1kg").max(100, "Max 100kg"),
  packageWidthCm: z.coerce.number().min(1, "Width must be at least 1cm").max(200, "Max 200cm"),
  packageHeightCm: z.coerce.number().min(1, "Height must be at least 1cm").max(200, "Max 200cm"),
  packageLengthCm: z.coerce.number().min(1, "Length must be at least 1cm").max(200, "Max 200cm"),
  pickupDate: z.date({ required_error: "Pickup date is required." }),

  serviceType: z.enum(["Standard", "Express"], {errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_enum_value && issue.received === '') {
      return { message: "Service type is required. Please select one." };
    }
    return { message: ctx.defaultError };
  }}),
});

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

interface PaymentStepData {
  show: boolean;
  amount: string;
  numericAmount: number | null;
  priceResponse: PriceApiResponse | null;
  formData: ShipmentFormValues | null;
  shipmentType: ShipmentTypeOption | null;
}

const parsePriceStringToNumber = (priceStr: string | number | undefined | null): number | null => {
  if (typeof priceStr === 'number') {
    return priceStr;
  }
  if (typeof priceStr === 'string') {
    const numericString = priceStr.replace(/[^0-9.-]+/g,"");
    const parsed = parseFloat(numericString);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};


export function BookShipmentForm() {
  const [submissionStatus, setSubmissionStatus] = useState<Partial<CreateShipmentResponse> | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStepData>({ show: false, amount: "Rs. 0.00", numericAmount: 0, priceResponse: null, formData: null, shipmentType: null });
  const { addShipment, isLoading: isShipmentContextLoading } = useShipments();
  const [isPricingLoading, setIsLoadingPricing] = useState(false);
  const [utr, setUtr] = useState<string>('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      shipmentTypeOption: undefined,
      senderName: '',
      senderAddressLine1: '', senderAddressLine2: '',
      senderAddressCity: '', senderAddressState: '', senderAddressPincode: '', senderAddressCountry: 'India',
      senderPhone: '',
      receiverName: '',
      receiverAddressLine1: '', receiverAddressLine2: '',
      receiverAddressCity: '', receiverAddressState: '', receiverAddressPincode: '', receiverAddressCountry: '',
      receiverPhone: '',
      packageWeightKg: 0.5,
      packageWidthCm: 10, packageHeightCm: 10, packageLengthCm: 10,
      pickupDate: new Date(),
      serviceType: "Standard", // Default service type
    },
  });

  const shipmentTypeOption = form.watch("shipmentTypeOption");

  useEffect(() => {
    if (user && user.firstName && user.lastName && !form.getValues('senderName')) {
      form.setValue('senderName', `${user.firstName} ${user.lastName}`);
    }
  }, [user, form]);

  useEffect(() => {
    form.resetField("receiverAddressState");
    form.resetField("receiverAddressCountry");
    form.clearErrors(["receiverAddressState", "receiverAddressCountry", "serviceType"]);

    if (shipmentTypeOption === "Domestic") {
      form.setValue("receiverAddressCountry", "India", { shouldTouch: true });
      form.setValue("serviceType", "Standard", { shouldTouch: true, shouldValidate: false }); // Set default for domestic
      form.setValue("receiverAddressPincode", "", { shouldTouch: true });
    } else if (shipmentTypeOption === "International") {
      form.setValue("serviceType", "Express", { shouldTouch: true, shouldValidate: false }); // Force Express for international
      form.setValue("receiverAddressCountry", "", { shouldTouch: true });
      form.setValue("receiverAddressPincode", "", { shouldTouch: true });
    }
  }, [shipmentTypeOption, form]);


  const onSubmitToPayment = async (data: ShipmentFormValues) => {
    setIsLoadingPricing(true);
    setPaymentStep({ show: false, amount: "Rs. 0.00", numericAmount: 0, priceResponse: null, formData: null, shipmentType: null });
    let numericTotalPrice: number | null = null;
    let displayAmountForQR = "Rs. 0.00";
    let priceResponseData: PriceApiResponse;

    // Ensure serviceType is correctly set for International before proceeding
    let effectiveServiceType = data.serviceType;
    if (data.shipmentTypeOption === "International") {
        effectiveServiceType = "Express";
        // Optionally, update form state if it somehow diverged, though useEffect should handle this
        if (form.getValues("serviceType") !== "Express") {
            form.setValue("serviceType", "Express", {shouldValidate: true});
        }
    }
     if (!effectiveServiceType) {
        form.setError("serviceType", { type: "manual", message: "Service type is required."});
        setIsLoadingPricing(false);
        return;
    }


    try {
      if (data.shipmentTypeOption === "Domestic") {
        if (!data.receiverAddressState) {
          form.setError("receiverAddressState", { type: "manual", message: "Receiver state is required for domestic pricing."});
          setIsLoadingPricing(false);
          return;
        }
        const domesticPayload: DomesticPriceRequest = {
          state: data.receiverAddressState,
          mode: effectiveServiceType.toLowerCase() as "express" | "standard",
          weight: data.packageWeightKg,
        };
        priceResponseData = await apiClient<DomesticPriceResponse>(`/api/domestic/price`, {
          method: 'POST',
          body: JSON.stringify(domesticPayload),
        });
        const domesticResp = priceResponseData as DomesticPriceResponse;
        if (domesticResp.error) throw new Error(domesticResp.error);
        numericTotalPrice = parsePriceStringToNumber(domesticResp.total_price);

      } else if (data.shipmentTypeOption === "International") {
         if (!data.receiverAddressCountry || data.receiverAddressCountry === "India") {
          form.setError("receiverAddressCountry", { type: "manual", message: "A non-Indian country is required for international pricing."});
          setIsLoadingPricing(false);
          return;
        }
        const internationalPayload: InternationalPriceRequest = {
          country: data.receiverAddressCountry,
          weight: data.packageWeightKg,
        };
        priceResponseData = await apiClient<InternationalPriceResponse>(`/api/international/price`, {
          method: 'POST',
          body: JSON.stringify(internationalPayload),
        });
        
        const intlResp = priceResponseData as InternationalPriceResponse;
        let rawPriceValue: string | number | undefined | null = null;

        if (intlResp.formatted_total && intlResp.formatted_total.trim() !== "") {
            rawPriceValue = intlResp.formatted_total;
        } else if (intlResp.total_price !== undefined && intlResp.total_price !== null) {
            rawPriceValue = intlResp.total_price;
        }
        
        numericTotalPrice = parsePriceStringToNumber(rawPriceValue);
        
        if (intlResp.error && numericTotalPrice === null) { // Only throw if error and price is still null
             toast({ title: "Pricing Error", description: intlResp.error, variant: "destructive" });
             setIsLoadingPricing(false);
             return;
        }
        if (numericTotalPrice === null && intlResp.error) {
             toast({ title: "Pricing Error", description: `Received error: ${intlResp.error}. Could not determine price.`, variant: "destructive" });
             setIsLoadingPricing(false);
             return;
        }
        if (numericTotalPrice === null) {
            toast({ title: "Pricing Error", description: "Invalid pricing data received for international shipment. Could not parse a valid number.", variant: "destructive" });
            setIsLoadingPricing(false);
            return;
        }
      } else {
        throw new Error("Invalid shipment type selected.");
      }

      if (numericTotalPrice === null || numericTotalPrice <= 0) {
        toast({ title: "Pricing Error", description: "Could not determine a valid positive price from API.", variant: "destructive" });
        setIsLoadingPricing(false);
        return;
      }

      displayAmountForQR = `Rs. ${numericTotalPrice.toFixed(2)}`;
      setPaymentStep({ show: true, amount: displayAmountForQR, numericAmount: numericTotalPrice, priceResponse: priceResponseData, formData: data, shipmentType: data.shipmentTypeOption });

    } catch (error: any) {
      const errorMessage = error?.data?.error || error.message || "Failed to fetch pricing.";
      toast({
        title: "Pricing Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const handleConfirmPaymentAndBook = async () => {
    if (!user || !user.email) {
      toast({ title: "Authentication Error", description: "You must be logged in to book a shipment.", variant: "destructive" });
      return;
    }
    if (!paymentStep.formData || !paymentStep.shipmentType || paymentStep.numericAmount === null || paymentStep.numericAmount <= 0) {
        toast({ title: "Booking Error", description: "Invalid payment data or price. Please try calculating price again.", variant: "destructive" });
        return;
    }

    const data = paymentStep.formData;
    let effectiveServiceType = data.serviceType;
    if (data.shipmentTypeOption === "International") {
        effectiveServiceType = "Express";
    }

    const senderStreetCombined = data.senderAddressLine2
      ? `${data.senderAddressLine1}, ${data.senderAddressLine2}`
      : data.senderAddressLine1;

    const receiverStreetCombined = data.receiverAddressLine2
      ? `${data.receiverAddressLine1}, ${data.receiverAddressLine2}`
      : data.receiverAddressLine1;

    const apiShipmentData: AddShipmentPayload = {
        sender_name: data.senderName,
        sender_address_street: senderStreetCombined,
        sender_address_city: data.senderAddressCity,
        sender_address_state: data.senderAddressState,
        sender_address_pincode: data.senderAddressPincode,
        sender_address_country: data.senderAddressCountry,
        sender_phone: data.senderPhone,

        receiver_name: data.receiverName,
        receiver_address_street: receiverStreetCombined,
        receiver_address_city: data.receiverAddressCity,
        receiver_address_state: data.receiverAddressState,
        receiver_address_pincode: data.receiverAddressPincode,
        receiver_address_country: data.receiverAddressCountry,
        receiver_phone: data.receiverPhone,

        package_weight_kg: data.packageWeightKg,
        package_width_cm: data.packageWidthCm,
        package_height_cm: data.packageHeightCm,
        package_length_cm: data.packageLengthCm,
        pickup_date: format(data.pickupDate, 'yyyy-MM-dd'),
        service_type: effectiveServiceType,
        final_total_price_with_tax: paymentStep.numericAmount,
        user_email: user.email,
    };

    try {
        const shipmentResponse = await addShipment(apiShipmentData);
        const shipmentIdStr = shipmentResponse.shipment_id_str;
        
        if (!shipmentIdStr || !paymentStep.numericAmount) {
          throw new Error("Missing shipment ID or amount after booking.");
        }
  
        // Submit the payment details (UTR) against the new shipment ID.
        const utrPayload: SubmitUtrPayload = {
          shipment_id_str: shipmentIdStr,
          utr: utr,
          amount: paymentStep.numericAmount,
        };
  
        await apiClient<SubmitUtrResponse>('/api/payments', {
          method: 'POST',
          body: JSON.stringify(utrPayload),
        });
  
        // Show success message to the user.
        setSubmissionStatus({
          message: `Your payment is under review. You can track its status on the 'My Payments' page.`,
          shipment_id_str: shipmentIdStr,
          data: shipmentResponse.data,
        });
  
        toast({
          title: "Submission Successful!",
          description: `Your UTR for shipment ${shipmentIdStr} has been submitted for review.`,
        });
        
        // Reset form and state
        form.reset({
            shipmentTypeOption: undefined,
            senderName: (user && user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : '',
            senderAddressLine1: '', senderAddressLine2: '',
            senderAddressCity: '', senderAddressState: '', senderAddressPincode: '', senderAddressCountry: 'India',
            senderPhone: '',
            receiverName: '',
            receiverAddressLine1: '', receiverAddressLine2: '',
            receiverAddressCity: '', receiverAddressState: '', receiverAddressPincode: '', receiverAddressCountry: '',
            receiverPhone: '',
            packageWeightKg: 0.5,
            packageWidthCm: 10, packageHeightCm: 10, packageLengthCm: 10,
            pickupDate: new Date(),
            serviceType: "Standard",
        });
        setPaymentStep({ show: false, amount: "Rs. 0.00", numericAmount: 0, priceResponse: null, formData: null, shipmentType: null });
        setUtr('');
        setUtrError(null);

    } catch (error: any) {
        const errorMessage = error?.data?.error || error.message || "Failed to book shipment or submit payment.";
        toast({
            title: "Submission Failed",
            description: errorMessage,
            variant: "destructive",
        });
    }
  };

  if (submissionStatus) {
    return (
      <Alert className="border-green-500 bg-green-50 text-green-700">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="font-headline text-green-700">Payment Submitted for Review</AlertTitle>
        <AlertDescription>
          <p>{submissionStatus.message}</p>
          <p>Shipment ID: <strong>{submissionStatus.shipment_id_str}</strong></p>
          <div className="mt-4 space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
            <Button onClick={() => { setSubmissionStatus(null); form.setValue("shipmentTypeOption", undefined);}} className="w-full sm:w-auto" variant="outline">
              Book Another Shipment
            </Button>
            <Button asChild className="w-full sm:w-auto" variant="default">
              <Link href="/dashboard/my-payments">
                <Wallet className="mr-2 h-4 w-4" /> Go to My Payments
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (paymentStep.show && paymentStep.formData) {
    const displayAmountForQRPage = paymentStep.amount;

    return (
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
            <ScanLine className="h-8 w-8 text-primary" /> Complete Your Payment
          </CardTitle>
          <CardDescription>Review details, scan QR to pay, and enter UTR to confirm.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-muted-foreground">Amount to Pay (GST Inclusive):</p>
            <p className="text-3xl font-bold text-primary flex items-center justify-center">
              {displayAmountForQRPage}
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
              src="/images/qr-code.png"
              alt="UPI QR Code for Payment"
              width={200}
              height={200}
              className="rounded-md border shadow-sm"
              data-ai-hint="payment QR code"
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="utrInput" className="font-semibold text-base flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-muted-foreground" /> Enter 12-digit UTR Number
            </Label>
            <Input
                id="utrInput"
                value={utr}
                onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setUtr(numericValue.slice(0, 12));
                    if (utrError) setUtrError(null);
                }}
                placeholder="Enter UTR from your payment app"
                maxLength={12}
                className="text-base"
            />
            {utrError && <p className="text-sm text-destructive mt-1">{utrError}</p>}
          </div>
          <p className="text-xs text-muted-foreground pt-2">This is a dummy payment page for simulation. No actual payment is processed. Enter any 12 digits for UTR.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-4">
          <Button
            onClick={() => {
                if (utr.length === 12) {
                    setUtrError(null);
                    handleConfirmPaymentAndBook();
                } else {
                    setUtrError("UTR must be exactly 12 digits.");
                }
            }}
            className="w-full text-lg py-3"
            disabled={isShipmentContextLoading || isPricingLoading}
          >
            {(isShipmentContextLoading || isPricingLoading) ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Submit for Review"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
                setPaymentStep({ ...paymentStep, show: false });
                setUtr('');
                setUtrError(null);
            }}
            className="w-full"
            disabled={isShipmentContextLoading || isPricingLoading}
          >
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
                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                    <User className="h-5 w-5" /> Sender Details
                  </h3>
                  <FormField control={form.control} name="senderName" render={({ field }) => ( <FormItem><FormLabel>Sender Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="senderAddressLine1" render={({ field }) => ( <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="senderAddressLine2" render={({ field }) => ( <FormItem><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input placeholder="Apt 4B, Near City Park" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="senderAddressCity" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Mumbai" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="senderAddressState" render={({ field }) => (
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
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="senderAddressPincode" render={({ field }) => ( <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="400001" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="senderAddressCountry" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="India" {...field} defaultValue="India" disabled={true} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <FormField control={form.control} name="senderPhone" render={({ field }) => ( <FormItem><FormLabel>Sender Phone</FormLabel><FormControl><Input type="tel" placeholder="+919876543210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </section>

                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                    <User className="h-5 w-5" /> Receiver Details
                  </h3>
                  <FormField control={form.control} name="receiverName" render={({ field }) => ( <FormItem><FormLabel>Receiver Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="receiverAddressLine1" render={({ field }) => ( <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="456 Market St" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="receiverAddressLine2" render={({ field }) => ( <FormItem><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input placeholder="Tower C, Opposite Central Mall" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="receiverAddressCity" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Receiver City" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="receiverAddressState" render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          {shipmentTypeOption === "Domestic" ? (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {indianStatesAndUTs.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                </SelectContent>
                            </Select>
                          ) : (
                            <Input placeholder="e.g., California" {...field} />
                          )}
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="receiverAddressPincode" render={({ field }) => ( <FormItem><FormLabel>Pincode / ZIP Code</FormLabel><FormControl><Input placeholder="110001 or 90210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="receiverAddressCountry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          {shipmentTypeOption === "International" ? (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {internationalCountryList.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            ) : (
                            <Input placeholder="India" {...field} defaultValue="India" disabled={true} />
                          )}
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>
                  <FormField control={form.control} name="receiverPhone" render={({ field }) => ( <FormItem><FormLabel>Receiver Phone</FormLabel><FormControl><Input type="tel" placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </section>

                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary"> <Package className="h-5 w-5" /> Package & Pickup Details </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <FormField control={form.control} name="packageWeightKg" render={({ field }) => ( <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="packageLengthCm" render={({ field }) => ( <FormItem><FormLabel>Length (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="packageWidthCm" render={({ field }) => ( <FormItem><FormLabel>Width (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 20" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="packageHeightCm" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 10" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                   <FormField
                      control={form.control}
                      name="pickupDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pickup Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full sm:w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
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
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </section>

                <section className="space-y-6 pt-6 border-t">
                  <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary"> <Package className="h-5 w-5" /> Service </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="serviceType" render={({ field }) => {
                       // Determine the actual value to be used by the Select component
                       // Prioritize "Express" if international, otherwise use field value or default to "Standard"
                       const currentFieldValue = field.value;
                       let selectValueToShow: ServiceType;

                       if (shipmentTypeOption === "International") {
                         selectValueToShow = "Express";
                       } else if (currentFieldValue === "Standard" || currentFieldValue === "Express") {
                         selectValueToShow = currentFieldValue;
                       } else {
                         selectValueToShow = "Standard"; // Fallback default
                       }

                      return (
                        <FormItem> <FormLabel>Service Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={selectValueToShow} // Use the derived value
                            disabled={shipmentTypeOption === "International"}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Standard">Standard</SelectItem>
                                <SelectItem value="Express">Express</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {shipmentTypeOption === 'International' && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Info size={14} /> International shipments default to Express.
                            </p>
                          )}
                        </FormItem>
                      );
                    }} />
                  </div>
                </section>

                <CardFooter className="p-0 pt-8">
                  <Button type="submit" className="w-full md:w-auto text-lg py-3 px-8 bg-primary hover:bg-primary/90" disabled={!shipmentTypeOption || form.formState.isSubmitting || isPricingLoading || isShipmentContextLoading}>
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
