
"use client"; 

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Shipment, AddressDetail } from '@/lib/types'; 
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, ArrowLeft, IndianRupee, Loader2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { mapApiShipmentToFrontend } from '@/contexts/shipment-context'; // Import the mapper

const formatAddress = (address: AddressDetail | undefined) => {
  if (!address) return "Address not available";
  return (
    <>
      {address.street}<br />
      {address.city}, {address.state} - {address.pincode}<br />
      {address.country}
    </>
  );
};


export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { logoutUser } = useAuth();

  // Parameter 'invoiceId' is actually the shipment_id_str
  const shipment_id_str_param = params.invoiceId as string; 

  const [shipment, setShipment] = useState<Shipment | null | undefined>(undefined); // Mapped shipment
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (shipment_id_str_param && shipment_id_str_param !== 'undefined') {
      const fetchShipmentForInvoice = async () => {
        setIsLoading(true);
        try {
          // API returns shipment with snake_case
          const fetchedApiShipment = await apiClient<any>(`/api/shipments/${shipment_id_str_param}`);
          // Map to frontend camelCase (or hybrid) Shipment object
          setShipment(mapApiShipmentToFrontend(fetchedApiShipment));
        } catch (error: any) {
          console.error("Error fetching shipment for invoice:", error);
          const errorMessage = error?.data?.error || error.message || "Could not load shipment details for invoice.";
          if (error.status === 422) {
            toast({
                title: "Authentication Issue",
                description: "Your session may have expired or is invalid. Please log in again.",
                variant: "destructive",
            });
            logoutUser();
            router.replace('/login');
          } else {
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
          setShipment(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchShipmentForInvoice();
    } else {
        toast({ title: "Invalid Invoice ID", description: "The provided invoice ID is not valid.", variant: "destructive" });
        setShipment(null);
        setIsLoading(false);
    }
  }, [shipment_id_str_param, toast, router, logoutUser]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print(); 
  };

  if (isLoading || shipment === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invoice Data Not Found</h1>
        <p className="text-muted-foreground mb-6">The shipment details for invoice ID {shipment_id_str_param} could not be loaded.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Use direct snake_case fields from the mapped shipment object
  const senderAddress: AddressDetail = {
    street: shipment.sender_address_street || '',
    city: shipment.sender_address_city || '',
    state: shipment.sender_address_state || '',
    pincode: shipment.sender_address_pincode || '',
    country: shipment.sender_address_country || '',
  };

  const receiverAddress: AddressDetail = {
    street: shipment.receiver_address_street || '',
    city: shipment.receiver_address_city || '',
    state: shipment.receiver_address_state || '',
    pincode: shipment.receiver_address_pincode || '',
    country: shipment.receiver_address_country || '',
  };
  
  const invoiceDate = shipment.booking_date ? parseISO(shipment.booking_date) : new Date();
  const dueDate = invoiceDate; 


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0">
      <Card className="shadow-xl print:shadow-none print:border-none">
        <CardHeader className="bg-muted/30 print:bg-transparent p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <Image src="/images/brand.png" alt={`${siteConfig.name} Logo`} width={180} height={45} className="object-contain mb-2 print:w-36" />
              <h1 className="text-3xl font-headline font-bold text-primary print:text-2xl">INVOICE</h1>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              {/* Display shipment.shipment_id_str */}
              <p className="font-semibold text-lg">Invoice #: {shipment.shipment_id_str}</p>
              <p className="text-sm text-muted-foreground">Date: {format(invoiceDate, 'dd MMM, yyyy')}</p>
              <p className="text-sm text-muted-foreground">Due Date: {format(dueDate, 'dd MMM, yyyy')}</p>
              <p className="text-sm text-muted-foreground">Shipment ID: {shipment.shipment_id_str}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-1 text-primary">Billed From:</h3>
              <p className="font-bold">{siteConfig.company.legalName}</p>
              <p className="text-sm text-muted-foreground">{siteConfig.company.address}</p>
              <p className="text-sm text-muted-foreground">Email: {siteConfig.company.email}</p>
              <p className="text-sm text-muted-foreground">Phone: {siteConfig.company.phone}</p>
              <p className="text-sm text-muted-foreground">GSTIN: {siteConfig.company.gstin}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-primary">Billed To:</h3>
              {/* Use shipment.sender_name */}
              <p className="font-bold">{shipment.sender_name}</p>
              <div className="text-sm text-muted-foreground">
                {formatAddress(senderAddress)}
              </div>
              {/* Use shipment.sender_phone */}
              <p className="text-sm text-muted-foreground">Phone: {shipment.sender_phone}</p>
            </div>
          </div>

          <Separator />

          <div>
             <h3 className="font-semibold mb-1 text-primary">Ship To:</h3>
              {/* Use shipment.receiver_name */}
              <p className="font-bold">{shipment.receiver_name}</p>
              <div className="text-sm text-muted-foreground">
                {formatAddress(receiverAddress)}
              </div>
              {/* Use shipment.receiver_phone */}
              <p className="text-sm text-muted-foreground">Phone: {shipment.receiver_phone}</p>
          </div>
          
          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2 text-primary">Order Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  <TableRow>
                    {/* Use shipment.service_type, shipment.package_weight_kg, shipment.shipment_id_str */}
                    <TableCell>{shipment.service_type} Shipping ({shipment.package_weight_kg}kg) for {shipment.shipment_id_str}</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                        {/* Use shipment.price_without_tax */}
                        {(shipment.price_without_tax || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                        {(shipment.price_without_tax || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                {/* Use shipment.price_without_tax */}
                <span className="font-medium flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{(shipment.price_without_tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (18%):</span>
                {/* Use shipment.tax_amount_18_percent */}
                <span className="font-medium flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{(shipment.tax_amount_18_percent || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Grand Total:</span>
                {/* Use shipment.total_with_tax_18_percent */}
                <span className="flex items-center"><IndianRupee className="h-5 w-5 mr-0.5" />{(shipment.total_with_tax_18_percent || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
             <h3 className="font-semibold mb-1 text-primary">Payment Status:</h3>
             <p className="font-bold text-lg text-green-600">PAID</p> {/* Assuming all are paid for invoice */}
          </div>

        </CardContent>
        <CardFooter className="p-6 border-t print:hidden">
          <div className="flex w-full justify-between items-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="space-x-2">
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print Invoice
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          .print\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
          .print\\:w-36 { width: 9rem !important; } 
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
