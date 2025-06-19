
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useShipments } from '@/hooks/use-shipments';
import { useInvoices } from '@/hooks/use-invoices';
import type { Shipment, Invoice, TrackingStage } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, PackageSearch, FileDown, Search, ListOrdered, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusColors: Record<TrackingStage, string> = {
  Booked: "bg-blue-100 text-blue-700 border-blue-300",
  "In Transit": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};

interface AdminOrderView {
  shipmentId: string;
  customerName: string;
  orderNumber: string; // Same as shipmentId for this app
  description: string;
  priceWithoutTax: number;
  taxAmount18: number;
  totalWithTax18: number;
  currentStatus: TrackingStage;
  bookingDate: Date;
}

export function AdminOrdersTable() {
  const { shipments, isLoading: shipmentsLoading, updateShipmentStatus } = useShipments();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrackingStage | 'all'>('all');

  const isLoading = shipmentsLoading || invoicesLoading;

  const processedOrders: AdminOrderView[] = useMemo(() => {
    if (isLoading) return [];
    return shipments
      .map(shipment => {
        const invoice = invoices.find(inv => inv.shipmentId === shipment.id);
        if (!invoice) {
          // This case should ideally not happen if an invoice is always created with a shipment
          return {
            shipmentId: shipment.id,
            customerName: shipment.senderName,
            orderNumber: shipment.id,
            description: `${shipment.serviceType} to ${shipment.receiverAddress.city}`,
            priceWithoutTax: 0,
            taxAmount18: 0,
            totalWithTax18: 0,
            currentStatus: shipment.status,
            bookingDate: shipment.bookingDate,
          };
        }
        const subtotal = invoice.subtotal;
        const tax18 = subtotal * 0.18; // Ensure this matches displayed "Tax (18%)"
        const total18 = subtotal + tax18;
        return {
          shipmentId: shipment.id,
          customerName: shipment.senderName,
          orderNumber: shipment.id,
          description: `${shipment.serviceType} (${shipment.packageWeight}kg) to ${shipment.receiverAddress.city || 'N/A'}`,
          priceWithoutTax: subtotal,
          taxAmount18: tax18,
          totalWithTax18: total18,
          currentStatus: shipment.status,
          bookingDate: shipment.bookingDate,
        };
      })
      .filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const statusMatch = statusFilter === 'all' || order.currentStatus === statusFilter;
        const searchMatch = 
            order.customerName.toLowerCase().includes(searchLower) ||
            order.orderNumber.toLowerCase().includes(searchLower) ||
            order.description.toLowerCase().includes(searchLower);
        return statusMatch && searchMatch;
      })
      .sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime());
  }, [shipments, invoices, isLoading, searchTerm, statusFilter]);

  const handleStatusUpdate = (shipmentId: string, newStatus: TrackingStage) => {
    updateShipmentStatus(shipmentId, newStatus);
  };

  const exportToCSV = useCallback(() => {
    const headers = [
      "Order Number", 
      "Customer Name", 
      "Description", 
      "Price (w/o Tax)", 
      "Tax (18%)", 
      "Total Price", 
      "Status",
      "Booking Date"
    ];
    const rows = processedOrders.map(order => [
      `"${order.orderNumber}"`, // Enclose in quotes for CSV safety
      `"${order.customerName}"`,
      `"${order.description}"`,
      order.priceWithoutTax.toFixed(2),
      order.taxAmount18.toFixed(2),
      order.totalWithTax18.toFixed(2),
      `"${order.currentStatus}"`,
      `"${format(order.bookingDate, 'yyyy-MM-dd HH:mm')}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shedload_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  }, [processedOrders]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><ListOrdered className="h-12 w-12 animate-pulse text-primary" /> <p className="ml-2">Loading orders...</p></div>;
  }

  return (
    <Card className="shadow-xl mt-8">
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <CardTitle className="font-headline text-xl sm:text-2xl flex items-center gap-2">
            <ListOrdered className="h-7 w-7 text-primary" /> All Orders
          </CardTitle>
          <CardDescription>View, manage, and export all customer orders.</CardDescription>
        </div>
        <Button onClick={exportToCSV} variant="outline" size="sm" className="mt-4 md:mt-0">
          <FileDown className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by Order No, Customer, Description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <div className="flex-grow md:flex-grow-0">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TrackingStage | 'all')}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {(Object.keys(statusColors) as TrackingStage[]).map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {processedOrders.length === 0 ? (
          <div className="text-center py-12">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No Orders Found</p>
            <p className="text-sm text-muted-foreground">Orders will appear here as they are booked by users.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price (Net)</TableHead>
                  <TableHead className="text-right">Tax (18%)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead className="text-center">Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedOrders.map((order) => (
                  <TableRow key={order.shipmentId}>
                    <TableCell className="font-medium text-primary">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.description}</TableCell>
                    <TableCell className="text-right">
                        <span className="inline-flex items-center justify-end">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                            {order.priceWithoutTax.toFixed(2)}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <span className="inline-flex items-center justify-end">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                            {order.taxAmount18.toFixed(2)}
                        </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                        <span className="inline-flex items-center justify-end">
                            <IndianRupee className="h-4 w-4 mr-0.5" />
                            {order.totalWithTax18.toFixed(2)}
                        </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[order.currentStatus])}>
                        {order.currentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(order.bookingDate, 'dd MMM yyyy, HH:mm')}</TableCell>
                    <TableCell className="text-center min-w-[180px]">
                      <Select
                        value={order.currentStatus}
                        onValueChange={(newStatus) => handleStatusUpdate(order.shipmentId, newStatus as TrackingStage)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusColors) as TrackingStage[]).map(status => (
                            <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

