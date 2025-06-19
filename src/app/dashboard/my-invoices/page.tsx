
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useInvoices } from '@/hooks/use-invoices';
import type { DisplayInvoice } from '@/lib/types'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Receipt, Search, Eye, IndianRupee, PackageSearch, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusColors: Record<DisplayInvoice['status'], string> = {
  Paid: "bg-green-100 text-green-700 border-green-300",
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
};


export default function MyInvoicesPage() {
  const { displayInvoices, isLoading, fetchUserShipmentsForInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchUserShipmentsForInvoices();
  }, [fetchUserShipmentsForInvoices]);

  const filteredInvoices = useMemo(() => {
    return displayInvoices
      .filter(invoice => {
        const searchLower = searchTerm.toLowerCase();
        // invoice.id and invoice.shipmentIdStr are now shipment_id_str
        const searchMatch = searchTerm === '' || 
                            (invoice.shipmentIdStr && invoice.shipmentIdStr.toLowerCase().includes(searchLower)) ||
                            (invoice.senderDetails?.name && invoice.senderDetails.name.toLowerCase().includes(searchLower)) ||
                            (invoice.receiverDetails?.name && invoice.receiverDetails.name.toLowerCase().includes(searchLower));
        return searchMatch;
      })
      .sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
  }, [displayInvoices, searchTerm]);

  if (isLoading && displayInvoices.length === 0) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-2">Loading invoices...</p>
        </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
          <Receipt className="h-8 w-8 text-primary" /> My Invoices
        </CardTitle>
        <CardDescription>View your shipment invoice history.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Invoice ID (Shipment ID), Sender, Receiver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
        
        {isLoading && displayInvoices.length > 0 && (
             <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Refreshing data...
            </div>
        )}

        {!isLoading && filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No Invoices Found</p>
            <p className="text-sm text-muted-foreground">Invoices will appear here after you book a shipment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID (Shipment ID)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  // invoice.id is shipment_id_str
                  <TableRow key={invoice.id}> 
                    <TableCell className="font-medium text-primary">{invoice.id || 'Unknown ID'}</TableCell>
                    <TableCell>{format(invoice.invoiceDate, 'dd MMM yyyy')}</TableCell>
                    <TableCell className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                      {invoice.grandTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[invoice.status])}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Use invoice.shipmentIdStr (which is shipment_id_str) for the link */}
                      <Button asChild variant="outline" size="sm" disabled={!invoice.shipmentIdStr || invoice.shipmentIdStr === 'Unknown ID'}>
                        <Link href={invoice.shipmentIdStr && invoice.shipmentIdStr !== 'Unknown ID' ? `/dashboard/invoice/${invoice.shipmentIdStr}` : '#'}>
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
