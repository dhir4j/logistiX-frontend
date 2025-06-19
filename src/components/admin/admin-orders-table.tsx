
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { Shipment, TrackingStage, AdminShipmentsResponse, UpdateShipmentStatusResponse } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, PackageSearch, FileDown, Search, ListOrdered, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const statusColors: Record<TrackingStage, string> = {
  Booked: "bg-blue-100 text-blue-700 border-blue-300",
  "In Transit": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};

// Helper to map API snake_case to frontend camelCase
const mapApiShipmentToFrontend = (apiShipment: any): Shipment => ({
  id: apiShipment.id,
  userId: apiShipment.user_id,
  shipmentIdStr: apiShipment.shipment_id_str,
  senderName: apiShipment.sender_name,
  senderAddressStreet: apiShipment.sender_address_street,
  senderAddressCity: apiShipment.sender_address_city,
  senderAddressState: apiShipment.sender_address_state,
  senderAddressPincode: apiShipment.sender_address_pincode,
  senderAddressCountry: apiShipment.sender_address_country,
  senderPhone: apiShipment.sender_phone,
  receiverName: apiShipment.receiver_name,
  receiverAddressStreet: apiShipment.receiver_address_street,
  receiverAddressCity: apiShipment.receiver_address_city,
  receiverAddressState: apiShipment.receiver_address_state,
  receiverAddressPincode: apiShipment.receiver_address_pincode,
  receiverAddressCountry: apiShipment.receiver_address_country,
  receiverPhone: apiShipment.receiver_phone,
  packageWeightKg: parseFloat(apiShipment.package_weight_kg),
  packageWidthCm: parseFloat(apiShipment.package_width_cm),
  packageHeightCm: parseFloat(apiShipment.package_height_cm),
  packageLengthCm: parseFloat(apiShipment.package_length_cm),
  pickupDate: apiShipment.pickup_date,
  serviceType: apiShipment.service_type,
  bookingDate: apiShipment.booking_date,
  status: apiShipment.status,
  priceWithoutTax: parseFloat(apiShipment.price_without_tax),
  taxAmount18Percent: parseFloat(apiShipment.tax_amount_18_percent),
  totalWithTax18Percent: parseFloat(apiShipment.total_with_tax_18_percent),
  trackingHistory: apiShipment.tracking_history || [],
  lastUpdatedAt: apiShipment.last_updated_at,
  // Fields for admin table if not directly on base Shipment model
  customerName: apiShipment.sender_name, // Assuming sender is customer
  orderNumber: apiShipment.shipment_id_str,
  description: `${apiShipment.service_type} (${apiShipment.package_weight_kg}kg) to ${apiShipment.receiver_address_city || 'N/A'}`,
});


export function AdminOrdersTable() {
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrackingStage | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const { token, user, isAuthenticated, logoutUser } = useAuth();
  const router = useRouter();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    if (error.status === 422) {
      toast({
        title: "Authentication Error",
        description: "Your session is invalid. Please log in again.",
        variant: "destructive",
      });
      logoutUser();
      router.replace('/login'); // Or admin login if separate
    } else {
      toast({
        title: `Error ${operation}`,
        description: error?.data?.error || error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [toast, logoutUser, router]);

  const fetchAdminShipments = useCallback(async (page = 1, search = searchTerm, status = statusFilter) => {
    if (!isAuthenticated || !user?.isAdmin || !token) {
        setAllShipments([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
    }
    setIsLoading(true);
    try {
      let queryParams = `?page=${page}&limit=${itemsPerPage}`;
      if (search) queryParams += `&q=${encodeURIComponent(search)}`;
      if (status !== 'all') queryParams += `&status=${encodeURIComponent(status)}`;
      
      const response = await apiClient<AdminShipmentsResponse>(`/api/admin/shipments${queryParams}`);
      setAllShipments(response.shipments.map(mapApiShipmentToFrontend));
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      handleApiError(error, 'fetching admin shipments');
      setAllShipments([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.isAdmin, isAuthenticated, itemsPerPage, searchTerm, statusFilter, handleApiError]); 

  useEffect(() => {
    fetchAdminShipments(1, searchTerm, statusFilter);
  }, [fetchAdminShipments, searchTerm, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAdminShipments(newPage, searchTerm, statusFilter);
    }
  };


  const handleStatusUpdate = async (shipmentIdStr: string, newStatus: TrackingStage, currentShipment: Shipment) => {
    let location = currentShipment.receiverAddressCity || "Destination City";
    let activity = `Status updated to ${newStatus}`;

    if (newStatus === "In Transit") activity = `Shipment is now In Transit`;
    if (newStatus === "Out for Delivery") activity = `Shipment is Out for Delivery in ${location}`;
    if (newStatus === "Delivered") activity = `Shipment has been Delivered to ${currentShipment.receiverName}`;
    if (newStatus === "Cancelled") activity = `Shipment has been Cancelled`;

    try {
      await apiClient<UpdateShipmentStatusResponse>(`/api/admin/shipments/${shipmentIdStr}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, location, activity }), // API expects snake_case
      });
      toast({ title: "Success", description: `Shipment ${shipmentIdStr} status updated to ${newStatus}.` });
      fetchAdminShipments(currentPage, searchTerm, statusFilter);
    } catch (error: any) {
      handleApiError(error, `updating status for ${shipmentIdStr}`);
    }
  };

  const exportToCSV = useCallback(() => {
    if (allShipments.length === 0) {
        toast({ title: "No Data", description: "Nothing to export.", variant: "default"});
        return;
    }
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
    const rows = allShipments.map(order => {
        const description = `${order.serviceType} (${order.packageWeightKg}kg) to ${order.receiverAddressCity || 'N/A'}`;
        return [
            `"${order.shipmentIdStr}"`,
            `"${order.senderName}"`,
            `"${description}"`,
            order.priceWithoutTax.toFixed(2),
            order.taxAmount18Percent.toFixed(2),
            order.totalWithTax18Percent.toFixed(2),
            `"${order.status}"`,
            `"${order.bookingDate ? format(parseISO(order.bookingDate), 'yyyy-MM-dd HH:mm') : 'N/A'}"`
        ];
    });

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shedload_all_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  }, [allShipments, toast]);

  return (
    <Card className="shadow-xl mt-8">
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <CardTitle className="font-headline text-xl sm:text-2xl flex items-center gap-2">
            <ListOrdered className="h-7 w-7 text-primary" /> All Orders ({totalCount})
          </CardTitle>
          <CardDescription>View, manage, and export all customer orders.</CardDescription>
        </div>
        <Button onClick={exportToCSV} variant="outline" size="sm" className="mt-4 md:mt-0" disabled={allShipments.length === 0}>
          <FileDown className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search Order No, Sender, Receiver..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                }}
                className="w-full pl-10"
              />
            </div>
            <div className="flex-grow md:flex-grow-0">
                <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value as TrackingStage | 'all');
                }}>
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

        {isLoading && (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-2">Loading orders...</p></div>
        )}

        {!isLoading && allShipments.length === 0 ? (
          <div className="text-center py-12">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No Orders Found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters. Orders will appear here as they are booked.</p>
          </div>
        ) : !isLoading && (
          <>
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
                    <TableHead>Current Status</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead className="text-center">Update Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allShipments.map((order) => {
                        const description = `${order.serviceType} (${order.packageWeightKg}kg) to ${order.receiverAddressCity || 'N/A'}`;
                        return (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium text-primary">{order.shipmentIdStr}</TableCell>
                                <TableCell>{order.senderName}</TableCell>
                                <TableCell>{description}</TableCell>
                                <TableCell className="text-right">
                                    <span className="inline-flex items-center justify-end">
                                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                                        {order.priceWithoutTax.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="inline-flex items-center justify-end">
                                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                                        {order.taxAmount18Percent.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    <span className="inline-flex items-center justify-end">
                                        <IndianRupee className="h-4 w-4 mr-0.5" />
                                        {order.totalWithTax18Percent.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                <Badge variant="outline" className={cn("text-xs", statusColors[order.status])}>
                                    {order.status}
                                </Badge>
                                </TableCell>
                                <TableCell>{order.bookingDate ? format(parseISO(order.bookingDate), 'dd MMM yyyy, HH:mm') : 'N/A'}</TableCell>
                                <TableCell className="text-center min-w-[180px]">
                                <Select
                                    value={order.status}
                                    onValueChange={(newStatus) => handleStatusUpdate(order.shipmentIdStr, newStatus as TrackingStage, order)}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {(Object.keys(statusColors) as TrackingStage[]).map(statusVal => (
                                        <SelectItem key={statusVal} value={statusVal} className="text-xs">{statusVal}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
