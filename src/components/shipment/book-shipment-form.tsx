
"use client";

import { useState } from 'react';
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
import { format } from "date-fns";
import { CalendarIcon, Package, User, ArrowRight, CheckCircle, PackagePlus, IndianRupee, ScanLine } from 'lucide-react';
import { useShipments } from '@/hooks/use-shipments';
import { useInvoices } from '@/hooks/use-invoices';
import type { Shipment, ServiceType, Invoice, InvoiceItem, AddressDetail } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const addressSchema = z.object({
  street: z.string().min(5, "Street address is required (min 5 chars)"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{5,6}$/, "Pincode must be 5 or 6 digits"),
  country: z.string().min(2, "Country is required"),
});

const shipmentSchema = z.object({
  senderName: z.string().min(2, "Sender name is required"),
  senderAddress: addressSchema,
  senderPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  receiverName: z.string().min(2, "Receiver name is required"),
  receiverAddress: addressSchema,
  receiverPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  packageWeight: z.coerce.number().min(0.1, "Weight must be at least 0.1kg"),
  packageWidth: z.coerce.number().min(1, "Width must be at least 1cm"),
  packageHeight: z.coerce.number().min(1, "Height must be at least 1cm"),
  packageLength: z.coerce.number().min(1, "Length must be at least 1cm"),
  pickupDate: z.date({ required_error: "Pickup date is required." }),
  serviceType: z.enum(["Standard", "Express"], { required_error: "Service type is required." }),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

const RATE_PER_HALF_KG = 45; // Rs. 45 per 0.5 kg
const BASE_CHARGE = 20; // Rs. 20 base charge
const EXPRESS_FEE = 50; // Rs. 50 extra for express
const TAX_RATE = 0.18; // 18% tax

export function BookShipmentForm() {
  const [submissionStatus, setSubmissionStatus] = useState<{ id: string; message: string, invoiceId: string } | null>(null);
  const [paymentStep, setPaymentStep] = useState<{ show: boolean; amount: number; formData: ShipmentFormValues | null }>({ show: false, amount: 0, formData: null });
  const { addShipment } = useShipments();
  const { addInvoice } = useInvoices();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      senderName: '',
      senderAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
      senderPhone: '',
      receiverName: '',
      receiverAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
      receiverPhone: '',
      packageWeight: 0.5,
      packageWidth: 10,
      packageHeight: 10,
      packageLength: 10,
      serviceType: "Standard",
    },
  });

  const calculateCharge = (data: ShipmentFormValues) => {
    const weightInHalfKgs = Math.ceil(data.packageWeight / 0.5);
    let charge = BASE_CHARGE + (weightInHalfKgs * RATE_PER_HALF_KG);
    if (data.serviceType === "Express") {
      charge += EXPRESS_FEE;
    }
    // This charge is subtotal (before tax)
    const taxAmount = charge * TAX_RATE;
    return charge + taxAmount; // This is grandTotal
  };

  const onSubmit = (data: ShipmentFormValues) => {
    const totalCharge = calculateCharge(data);
    setPaymentStep({ show: true, amount: totalCharge, formData: data });
  };

  const handleConfirmPaymentAndBook = () => {
    if (!paymentStep.formData) return;

    const data = paymentStep.formData;
    const shipmentId = `RS${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newShipment: Shipment = {
      id: shipmentId,
      senderName: data.senderName,
      senderAddress: data.senderAddress,
      senderPhone: data.senderPhone,
      receiverName: data.receiverName,
      receiverAddress: data.receiverAddress,
      receiverPhone: data.receiverPhone,
      packageWeight: data.packageWeight,
      packageWidth: data.packageWidth,
      packageHeight: data.packageHeight,
      packageLength: data.packageLength,
      pickupDate: data.pickupDate,
      serviceType: data.serviceType,
      bookingDate: new Date(), // Will be overridden by context's addShipment
      status: "Booked",
      lastUpdatedAt: new Date(), // Will be overridden by context's addShipment
    };
    addShipment(newShipment);

    const grandTotal = paymentStep.amount;
    const subtotal = grandTotal / (1 + TAX_RATE); // Calculate subtotal from grandTotal and TAX_RATE
    const taxAmount = grandTotal - subtotal;

    const invoiceItem: InvoiceItem = {
      description: `${data.serviceType} Shipping for package ${shipmentId} (${data.packageWeight}kg)`,
      quantity: 1,
      unitPrice: subtotal,
      total: subtotal,
    };
    
    const invoiceId = `INV-${shipmentId}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      shipmentId: shipmentId,
      invoiceDate: new Date(),
      dueDate: new Date(), 
      senderDetails: {
        name: data.senderName,
        address: data.senderAddress,
        phone: data.senderPhone,
      },
      receiverDetails: {
        name: data.receiverName,
        address: data.receiverAddress,
        phone: data.receiverPhone,
      },
      items: [invoiceItem],
      subtotal: subtotal,
      taxRate: TAX_RATE,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      status: "Paid", 
      serviceType: data.serviceType,
      packageWeight: data.packageWeight,
    };
    addInvoice(newInvoice);

    setSubmissionStatus({ 
      id: shipmentId, 
      message: `Shipment booked successfully! Your Shipment ID is: ${shipmentId}. Invoice ${invoiceId} has been generated.`,
      invoiceId: invoiceId,
    });
    form.reset();
    setPaymentStep({ show: false, amount: 0, formData: null });
  };

  if (submissionStatus) {
    return (
      <Alert className="border-green-500 bg-green-50 text-green-700">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="font-headline text-green-700">Shipment Confirmed!</AlertTitle>
        <AlertDescription>
          <p>{submissionStatus.message}</p>
          <div className="mt-4 space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
            <Button onClick={() => setSubmissionStatus(null)} className="w-full sm:w-auto" variant="outline">
              Book Another Shipment
            </Button>
             <Button asChild className="w-full sm:w-auto" variant="default">
                <a href={`/dashboard/invoice/${submissionStatus.invoiceId}`} target="_blank" rel="noopener noreferrer">View Invoice</a>
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
            <p className="text-muted-foreground">Amount to Pay:</p>
            <p className="text-3xl font-bold text-primary flex items-center justify-center">
              <IndianRupee className="h-7 w-7 mr-1" />{paymentStep.amount.toFixed(2)}
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
          <p className="text-xs text-muted-foreground">This is a dummy payment page. No actual payment will be processed.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleConfirmPaymentAndBook} className="w-full text-lg py-3">
            I Have Completed The Payment
          </Button>
          <Button variant="outline" onClick={() => setPaymentStep({ show: false, amount: 0, formData: null })} className="w-full">
            Cancel Payment
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-6">
                <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" /> Sender Details
                </h3>
                <FormField control={form.control} name="senderName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="senderAddress.street" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address / Building</FormLabel>
                    <FormControl><Input placeholder="123 Main St, Apt 4B" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="senderAddress.city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="senderAddress.state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="senderAddress.pincode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl><Input placeholder="400001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="senderAddress.country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input placeholder="India" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="senderPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="+919876543210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </section>

              <section className="space-y-6">
                <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" /> Receiver Details
                </h3>
                <FormField control={form.control} name="receiverName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver Name</FormLabel>
                    <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="receiverAddress.street" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address / Building</FormLabel>
                    <FormControl><Input placeholder="456 Market St, Tower C" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="receiverAddress.city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="Delhi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="receiverAddress.state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input placeholder="Delhi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="receiverAddress.pincode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl><Input placeholder="110001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="receiverAddress.country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input placeholder="India" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="receiverPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="+919123456789" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </section>
            </div>

            <section className="space-y-6 pt-6 border-t">
              <h3 className="font-headline text-lg sm:text-xl font-semibold border-b pb-2 flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" /> Package Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="packageWeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="packageLength" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 30" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="packageWidth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (cm)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="packageHeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="e.g., 15" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>
            
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
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
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
              <Button type="submit" className="w-full md:w-auto text-lg py-3 px-8 bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

