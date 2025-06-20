
"use client"; 

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Shipment, AddressDetail, PriceApiResponse, DomesticPriceRequest, DomesticPriceResponse, InternationalPriceRequest, InternationalPriceResponse } from '@/lib/types'; 
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, ArrowLeft, IndianRupee, Loader2, AlertTriangle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { mapApiShipmentToFrontend } from '@/contexts/shipment-context'; 

const formatAddress = (address: AddressDetail | undefined) => {
  if (!address) return "Address not available";
  const street = address.street;
  const city = address.city;
  const state = address.state;
  const pincode = address.pincode;
  const country = address.country;

  const parts = [
    street,
    `${city ? city + ', ' : ''}${state ? state + ' - ' : ''}${pincode}`,
    country
  ].filter(Boolean);

  if (parts.length === 0 && (street || city || state || pincode || country)) {
    return "Address details incomplete.";
  }
  if (parts.length === 0) return "Address not available";

  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

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


export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { logoutUser } = useAuth();

  const shipment_id_str_param = params.invoiceId as string; 

  const [shipment, setShipment] = useState<Shipment | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [displaySubtotal, setDisplaySubtotal] = useState<number | null>(null);
  const [displayTax, setDisplayTax] = useState<number | null>(null);
  const [displayGrandTotal, setDisplayGrandTotal] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchShipmentForInvoice = async () => {
      setIsLoading(true);
      if (shipment_id_str_param && shipment_id_str_param !== 'undefined' && shipment_id_str_param !== 'null') {
        try {
          const fetchedApiShipment = await apiClient<any>(`/api/shipments/${shipment_id_str_param}`);
          const mappedShipment = mapApiShipmentToFrontend(fetchedApiShipment);
          setShipment(mappedShipment);

          // Use stored values directly as they are now the source of truth
          setDisplaySubtotal(mappedShipment.priceWithoutTax);
          setDisplayTax(mappedShipment.taxAmount18Percent);
          setDisplayGrandTotal(mappedShipment.totalWithTax18Percent);

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
      } else {
          toast({ title: "Invalid Invoice ID", description: "The provided invoice ID is not valid.", variant: "destructive" });
          setShipment(null);
          setIsLoading(false);
      }
    };
    fetchShipmentForInvoice();
  }, [shipment_id_str_param, toast, router, logoutUser]);


  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print(); 
  };

  if (isLoading || shipment === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] print:hidden">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center print:hidden">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invoice Data Not Found</h1>
        <p className="text-muted-foreground mb-6">The shipment details for invoice ID {shipment_id_str_param} could not be loaded.</p>
        <Button onClick={() => router.back()} className="print:hidden">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

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
  
  const invoiceDateStr = shipment.booking_date || new Date().toISOString();
  const invoiceDate = isValid(parseISO(invoiceDateStr)) ? parseISO(invoiceDateStr) : new Date();
  const dueDate = invoiceDate; 

  // Use state variables for display, which are set from the fetched shipment
  const subtotalToRender = displaySubtotal;
  const taxToRender = displayTax;
  const grandTotalToRender = displayGrandTotal;


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0">
      <Card className="shadow-xl print:shadow-none print:border-none">
        <CardHeader className="bg-muted/30 print:bg-transparent p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <Image src="/images/brand.png" alt={`${siteConfig.name} Logo`} width={180} height={45} className="object-contain mb-2 print:w-36" />
              <h1 className="text-3xl font-headline font-bold text-primary print:text-2xl">INVOICE</h1>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <p className="font-semibold text-lg">Invoice #: {shipment.shipment_id_str}</p>
              <p className="text-sm text-muted-foreground">Date: {format(invoiceDate, 'dd MMM, yyyy')}</p>
              <p className="text-sm text-muted-foreground">Due Date: {format(dueDate, 'dd MMM, yyyy')}</p>
              <p className="text-sm text-muted-foreground">Shipment ID: {shipment.shipment_id_str}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <h3 className="font-semibold text-primary">Billed From:</h3>
              <p className="font-bold text-sm">{siteConfig.company.legalName}</p>
              <p className="text-xs text-muted-foreground">{siteConfig.company.address}</p>
              <p className="text-xs text-muted-foreground">Email: {siteConfig.company.email}</p>
              {(siteConfig.company.phone && siteConfig.company.phone.toLowerCase() !== 'n/a') && 
                <p className="text-xs text-muted-foreground">Phone: {siteConfig.company.phone}</p>
              }
              <p className="text-xs text-muted-foreground">GSTIN: {siteConfig.company.gstin}</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary">Billed To:</h3>
              <p className="font-bold text-sm">{shipment.sender_name || 'N/A'}</p>
              <div className="text-xs text-muted-foreground">
                {formatAddress(senderAddress)}
              </div>
              {(shipment.sender_phone && shipment.sender_phone.toLowerCase() !== 'n/a' && shipment.sender_phone.trim() !== '') &&
                <p className="text-xs text-muted-foreground">Phone: {shipment.sender_phone}</p>
              }
            </div>
             <div> 
              <h3 className="font-semibold text-primary">Ship To:</h3>
              <p className="font-bold text-sm">{shipment.receiver_name || 'N/A'}</p>
              <div className="text-xs text-muted-foreground">
                {formatAddress(receiverAddress)}
              </div>
              {(shipment.receiver_phone && shipment.receiver_phone.toLowerCase() !== 'n/a' && shipment.receiver_phone.trim() !== '') &&
                <p className="text-xs text-muted-foreground">Phone: {shipment.receiver_phone}</p>
              }
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-1 text-primary">Order Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%] px-2 py-2">Description</TableHead> 
                  <TableHead className="text-right px-2 py-2">Qty</TableHead>
                  <TableHead className="text-right px-2 py-2">Unit Price</TableHead>
                  <TableHead className="text-right px-2 py-2">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  <TableRow>
                    <TableCell className="px-2 py-2">{shipment.service_type || 'N/A'} Shipping ({shipment.package_weight_kg || 'N/A'}kg) for {shipment.shipment_id_str}</TableCell>
                    <TableCell className="text-right px-2 py-2">1</TableCell>
                    <TableCell className="text-right px-2 py-2">
                        <span className="inline-flex items-center justify-end">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                            {(subtotalToRender !== null ? subtotalToRender : 0).toFixed(2)}
                        </span>
                    </TableCell>
                    <TableCell className="text-right px-2 py-2">
                        <span className="inline-flex items-center justify-end">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                            {(subtotalToRender !== null ? subtotalToRender : 0).toFixed(2)}
                        </span>
                    </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{(subtotalToRender !== null ? subtotalToRender : 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (18%):</span>
                <span className="font-medium flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{(taxToRender !== null ? taxToRender : 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold text-primary">
                <span>Grand Total:</span>
                <span className="flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{(grandTotalToRender !== null ? grandTotalToRender : 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
             <h3 className="font-semibold text-primary">Payment Status:</h3>
             <p className="font-bold text-green-600">PAID</p>
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
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #fff !important; /* Ensure white background for print */
          }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          .print\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
          .print\\:w-36 { width: 9rem !important; } 
          .print\\:hidden { display: none !important; }
          /* Ensure the main content wrapper of the invoice page takes full width/height */
          div.max-w-4xl.mx-auto { 
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Ensure the Card takes full width/height within its container */
          .print\\:shadow-none.print\\:border-none {
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
          }
        }
        @page {
          size: auto; /* auto is the initial value */
          margin: 0.5cm; /* Adjust as needed, affects browser header/footer space */
        }
      `}</style>
    </div>
  );
}
