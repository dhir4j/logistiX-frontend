
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
import { mapApiShipmentToFrontend } from '@/contexts/shipment-context'; // Import the mapper

const statusColors: Record<TrackingStage, string> = {
  Booked: "bg-blue-100 text-blue-700 border-blue-300",
  "In Transit": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};

export function AdminOrdersTable() {
  const [allShipments, setAllShipments] = useState<Shipment[]>([]); // Stores mapped (camelCase) shipments
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrackingStage | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const { user, isAuthenticated, logoutUser } = useAuth();
  const router = useRouter();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    const errorMessage = error?.data?.error || error.message || "An unexpected error occurred.";
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
          title: `Error ${operation}`,
          description: errorMessage,
          variant: "destructive",
        });
    }
  }, [toast, logoutUser, router]);

  const fetchAdminShipments = useCallback(async (page = 1, search = searchTerm, status = statusFilter) => {
    if (!isAuthenticated || !user?.isAdmin) {
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
      
      // API returns AdminShipmentsResponse with snake_case shipments
      const response = await apiClient<AdminShipmentsResponse>(`/api/admin/shipments${queryParams}`);
      // Map snake_case shipments to frontend camelCase (or hybrid)
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
  }, [user?.isAdmin, isAuthenticated, itemsPerPage, searchTerm, statusFilter, handleApiError]); 

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchAdminShipments(1, searchTerm, statusFilter);
    } else {
      setAllShipments([]);
      setTotalCount(0);
      setTotalPages(1);
    }
  }, [fetchAdminShipments, searchTerm, statusFilter, isAuthenticated, user?.isAdmin]); // Removed direct call to fetchAdminShipments from here

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAdminShipments(newPage, searchTerm, statusFilter);
    }
  };


  const handleStatusUpdate = async (shipment_id_str_to_update: string, newStatus: TrackingStage, currentShipment: Shipment) => {
    if (!isAuthenticated || !user?.isAdmin) {
        toast({ title: "Access Denied", description: "You are not authorized to perform this action.", variant: "destructive"});
        return;
    }
    // Use receiver_address_city from the mapped (currentShipment) object
    let location = currentShipment.receiver_address_city || "Destination City";
    let activity = `Status updated to ${newStatus}`;

    if (newStatus === "In Transit") activity = `Shipment is now In Transit`;
    if (newStatus === "Out for Delivery") activity = `Shipment is Out for Delivery in ${location}`;
    // Use receiver_name from the mapped (currentShipment) object
    if (newStatus === "Delivered") activity = `Shipment has been Delivered to ${currentShipment.receiver_name}`;
    if (newStatus === "Cancelled") activity = `Shipment has been Cancelled`;

    try {
      // API request body uses snake_case
      const response = await apiClient<UpdateShipmentStatusResponse>(`/api/admin/shipments/${shipment_id_str_to_update}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, location, activity }),
      });
      toast({ title: "Success", description: `Shipment ${shipment_id_str_to_update} status updated to ${newStatus}.` });
      
      // Update local state instead of full refetch
      const updatedShipmentMapped = mapApiShipmentToFrontend(response.updatedShipment); // Map the returned snake_case object
      setAllShipments(prevShipments => 
        prevShipments.map(s => s.shipment_id_str === shipment_id_str_to_update ? updatedShipmentMapped : s)
      );

    } catch (error: any) {
      handleApiError(error, `updating status for ${shipment_id_str_to_update}`);
    }
  };

  const exportToCSV = useCallback(() => {
    if (allShipments.length === 0) {
        toast({ title: "No Data", description: "Nothing to export.", variant: "default"});
        return;
    }
    const headers = [
      "Order Number (shipment_id_str)", 
      "Customer Name (sender_name)", 
      "Description", 
      "Price (w/o Tax)", 
      "Tax (18%)", 
      "Total Price", 
      "Status",
      "Booking Date"
    ];
    // Use snake_case fields from the mapped shipments for CSV export, as they come directly from API
    const rows = allShipments.map(order => {
        const description = `${order.service_type} (${order.package_weight_kg}kg) to ${order.receiver_address_city || 'N/A'}`;
        return [
            `"${order.shipment_id_str}"`,
            `"${order.sender_name}"`,
            `"${description}"`,
            order.price_without_tax.toFixed(2),
            order.tax_amount_18_percent.toFixed(2),
            order.total_with_tax_18_percent.toFixed(2),
            `"${order.status}"`,
            `"${order.booking_date ? format(parseISO(order.booking_date), 'yyyy-MM-dd HH:mm') : 'N/A'}"`
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

  if (!isAuthenticated || !user?.isAdmin) {
    return (
        <Card className="shadow-xl mt-8">
            <CardHeader>
                <CardTitle className="font-headline text-xl sm:text-2xl">Access Denied</CardTitle>
                <CardDescription>You do not have permission to view this page.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Please log in as an administrator.</p>
            </CardContent>
        </Card>
    );
  }

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
                    // Debounce or trigger search on button click if preferred
                    // fetchAdminShipments(1, e.target.value, statusFilter);
                }}
                className="w-full pl-10"
              />
            </div>
            <div className="flex-grow md:flex-grow-0">
                <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value as TrackingStage | 'all');
                    // fetchAdminShipments(1, searchTerm, value as TrackingStage | 'all');
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
             <Button onClick={() => fetchAdminShipments(1, searchTerm, statusFilter)} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                Apply Filters
            </Button>
        </div>

        {isLoading && allShipments.length === 0 && ( // Initial loading state
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-2">Loading orders...</p></div>
        )}
        
        {isLoading && allShipments.length > 0 && ( // Refreshing state
             <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Refreshing data...
            </div>
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
                    {allShipments.map((order) => { // order is a mapped (camelCase) Shipment
                        // Use snake_case fields from the mapped order object for display
                        const description = `${order.service_type} (${order.package_weight_kg}kg) to ${order.receiver_address_city || 'N/A'}`;
                        return (
                            // Use order.shipment_id_str for key
                            <TableRow key={order.shipment_id_str}>
                                <TableCell className="font-medium text-primary">{order.shipment_id_str || 'Unknown ID'}</TableCell>
                                <TableCell>{order.sender_name}</TableCell>
                                <TableCell>{description}</TableCell>
                                <TableCell className="text-right">
                                    <span className="inline-flex items-center justify-end">
                                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                                        {order.price_without_tax.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="inline-flex items-center justify-end">
                                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                                        {order.tax_amount_18_percent.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    <span className="inline-flex items-center justify-end">
                                        <IndianRupee className="h-4 w-4 mr-0.5" />
                                        {order.total_with_tax_18_percent.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                <Badge variant="outline" className={cn("text-xs", statusColors[order.status])}>
                                    {order.status}
                                </Badge>
                                </TableCell>
                                <TableCell>{order.booking_date ? format(parseISO(order.booking_date), 'dd MMM yyyy, HH:mm') : 'N/A'}</TableCell>
                                <TableCell className="text-center min-w-[180px]">
                                <Select
                                    value={order.status}
                                    // Pass order.shipment_id_str for status update
                                    onValueChange={(newStatus) => handleStatusUpdate(order.shipment_id_str, newStatus as TrackingStage, order)}
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
