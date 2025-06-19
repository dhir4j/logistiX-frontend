
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Package, User, ArrowRight, CheckCircle, PackagePlus } from 'lucide-react';
import { useShipments } from '@/hooks/use-shipments';
import { useInvoices } from '@/hooks/use-invoices';
import type { Shipment, ServiceType, Invoice, InvoiceItem } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const shipmentSchema = z.object({
  senderName: z.string().min(2, "Sender name is required"),
  senderAddress: z.string().min(10, "Sender address is required"),
  senderPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  receiverName: z.string().min(2, "Receiver name is required"),
  receiverAddress: z.string().min(10, "Receiver address is required"),
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
const TAX_RATE = 0.05; // 5% tax

export function BookShipmentForm() {
  const [submissionStatus, setSubmissionStatus] = useState<{ id: string; message: string, invoiceId: string } | null>(null);
  const { addShipment } = useShipments();
  const { addInvoice } = useInvoices();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      senderName: '',
      senderAddress: '',
      senderPhone: '',
      receiverName: '',
      receiverAddress: '',
      receiverPhone: '',
      packageWeight: 0.5,
      packageWidth: 10,
      packageHeight: 10,
      packageLength: 10,
      serviceType: "Standard",
    },
  });

  const onSubmit = (data: ShipmentFormValues) => {
    const shipmentId = `RS${Math.floor(100000 + Math.random() * 900000)}`;
    const newShipment: Shipment = {
      ...data,
      id: shipmentId,
      bookingDate: new Date(),
      status: "Booked",
    };
    addShipment(newShipment);

    // Create Invoice
    const weightInHalfKgs = Math.ceil(data.packageWeight / 0.5);
    let calculatedCharge = BASE_CHARGE + (weightInHalfKgs * RATE_PER_HALF_KG);
    if (data.serviceType === "Express") {
      calculatedCharge += EXPRESS_FEE;
    }

    const taxAmount = calculatedCharge * TAX_RATE;
    const grandTotal = calculatedCharge + taxAmount;

    const invoiceItem: InvoiceItem = {
      description: `${data.serviceType} Shipping for package ${shipmentId} (${data.packageWeight}kg)`,
      quantity: 1,
      unitPrice: calculatedCharge,
      total: calculatedCharge,
    };
    
    const invoiceId = `INV-${shipmentId}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      shipmentId: shipmentId,
      invoiceDate: new Date(),
      dueDate: new Date(), // Same as invoice date for simulation
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
      subtotal: calculatedCharge,
      taxRate: TAX_RATE,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      status: "Paid", // Simulated as paid
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
                <FormField control={form.control} name="senderAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Address</FormLabel>
                    <FormControl><Textarea placeholder="123 Main St, City, Country, Pincode" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="senderPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="+1234567890" {...field} /></FormControl>
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
                <FormField control={form.control} name="receiverAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver Address</FormLabel>
                    <FormControl><Textarea placeholder="456 Market St, City, Country, Pincode" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="receiverPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="+0987654321" {...field} /></FormControl>
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
                {form.formState.isSubmitting ? 'Booking...' : 'Book Shipment'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
