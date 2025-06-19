
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/use-invoices';
import type { Invoice } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, ArrowLeft, IndianRupee, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvoiceById, isLoading: invoicesLoading } = useInvoices();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined); // undefined for loading, null for not found

  const invoiceId = params.invoiceId as string;

  useEffect(() => {
    if (invoiceId && !invoicesLoading) {
      const foundInvoice = getInvoiceById(invoiceId);
      setInvoice(foundInvoice);
    }
  }, [invoiceId, getInvoiceById, invoicesLoading]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // PDF generation is complex on client-side. This is a placeholder.
    toast({
      title: "Download PDF",
      description: "PDF download functionality is coming soon!",
    });
  };

  if (invoicesLoading || invoice === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
        <p className="text-muted-foreground mb-6">The invoice you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

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
              <p className="font-semibold text-lg">Invoice #: {invoice.id}</p>
              <p className="text-sm text-muted-foreground">Date: {format(invoice.invoiceDate, 'dd MMM, yyyy')}</p>
              <p className="text-sm text-muted-foreground">Due Date: {format(invoice.dueDate, 'dd MMM, yyyy')}</p>
              <p className="text-sm text-muted-foreground">Shipment ID: {invoice.shipmentId}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-1 text-primary">Billed From:</h3>
              <p className="font-bold">{siteConfig.name}</p>
              <p className="text-sm text-muted-foreground">18AX MODEL TOWN EXTENSION</p>
              <p className="text-sm text-muted-foreground">LUDHIANA, NEAR PUNJAB & SIND BANK</p>
              <p className="text-sm text-muted-foreground">Email: RSSWIFTCOURIERS@GMAIL.COM</p>
              <p className="text-sm text-muted-foreground">Phone: +91 95411 95406</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-primary">Billed To:</h3>
              <p className="font-bold">{invoice.senderDetails.name}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.senderDetails.address}</p>
              <p className="text-sm text-muted-foreground">Phone: {invoice.senderDetails.phone}</p>
            </div>
          </div>

          <Separator />

          <div>
             <h3 className="font-semibold mb-1 text-primary">Ship To:</h3>
              <p className="font-bold">{invoice.receiverDetails.name}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.receiverDetails.address}</p>
              <p className="text-sm text-muted-foreground">Phone: {invoice.receiverDetails.phone}</p>
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
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />{item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />{item.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({(invoice.taxRate * 100).toFixed(0)}%):</span>
                <span className="font-medium flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" />{invoice.taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Grand Total:</span>
                <span className="flex items-center"><IndianRupee className="h-5 w-5 mr-0.5" />{invoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
             <h3 className="font-semibold mb-1 text-primary">Payment Status:</h3>
             <p className={`font-bold text-lg ${invoice.status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                {invoice.status.toUpperCase()}
             </p>
          </div>

        </CardContent>
        <CardFooter className="p-6 border-t print:hidden">
          <div className="flex w-full justify-between items-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
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
          .print\\:w-36 { width: 9rem !important; } /* 144px for logo */
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
