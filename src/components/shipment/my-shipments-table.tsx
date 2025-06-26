
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useShipments } from '@/hooks/use-shipments';
import type { Shipment, TrackingStage } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { PackageSearch, Filter, CalendarDays, ListFilter, Search, ListOrdered, Loader2, Eye } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";
import Link from 'next/link';

const statusColors: Record<TrackingStage, string> = {
  "Pending Payment": "bg-gray-100 text-gray-700 border-gray-300",
  Booked: "bg-blue-100 text-blue-700 border-blue-300",
  "In Transit": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};

export function MyShipmentsTable() {
  const { shipments, isLoading, fetchUserShipments } = useShipments();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchUserShipments();
  }, [fetchUserShipments]);

  const filteredShipments = useMemo(() => {
    return shipments // shipments from context are already mapped (camelCase)
      .filter(shipment => {
        const statusMatch = filterStatus === 'all' || shipment.status === filterStatus;
        const bookingDateObj = shipment.booking_date ? parseISO(shipment.booking_date) : null; // Use booking_date from API
        const dateMatch = !filterDate || (bookingDateObj && format(bookingDateObj, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd'));
        
        const searchLower = searchTerm.toLowerCase();
        // Use shipment.shipment_id_str for searching ID
        const searchMatch = searchTerm === '' || 
                            (shipment.shipment_id_str && shipment.shipment_id_str.toLowerCase().includes(searchLower)) ||
                            (shipment.sender_name && shipment.sender_name.toLowerCase().includes(searchLower)) || // Search sender_name
                            (shipment.receiver_name && shipment.receiver_name.toLowerCase().includes(searchLower)); // Search receiver_name
        return statusMatch && dateMatch && searchMatch;
      })
      .sort((a, b) => {
        const dateA = a.booking_date ? parseISO(a.booking_date).getTime() : 0; // Use booking_date
        const dateB = b.booking_date ? parseISO(b.booking_date).getTime() : 0; // Use booking_date
        return dateB - dateA;
      });
  }, [shipments, filterStatus, filterDate, searchTerm]);

  if (isLoading && shipments.length === 0) { 
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading shipments...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
          <ListOrdered className="h-8 w-8 text-primary" /> My Shipments
        </CardTitle>
        <CardDescription>View and manage your shipment history.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4 md:space-y-0 md:flex md:items-end md:justify-between md:gap-4">
          <div className="flex-grow relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Sender, Receiver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <div className="flex-grow">
              <Label htmlFor="status-filter" className="sr-only">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status-filter" className="w-full md:w-[180px]">
                  <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
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
            <div className="flex-grow">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full md:w-[240px] justify-start text-left font-normal",
                      !filterDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "PPP") : <span>Filter by Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
             { (filterStatus !== 'all' || filterDate || searchTerm !== '') && (
                <Button variant="ghost" onClick={() => {setFilterStatus('all'); setFilterDate(undefined); setSearchTerm('');}}>
                  Clear Filters
                </Button>
              )}
          </div>
        </div>

        {isLoading && shipments.length > 0 && ( 
             <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Refreshing data...
            </div>
        )}

        {!isLoading && filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No Shipments Found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or book a new shipment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  // Use shipment.shipment_id_str for key as it's guaranteed unique from API
                  <TableRow key={shipment.shipment_id_str}> 
                    {/* Display shipment.shipment_id_str */}
                    <TableCell className="font-medium text-primary">{shipment.shipment_id_str || 'Unknown ID'}</TableCell>
                    {/* Use booking_date from API for formatting */}
                    <TableCell>{shipment.booking_date ? format(parseISO(shipment.booking_date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                    {/* Use sender_name from API */}
                    <TableCell>{shipment.sender_name}</TableCell>
                    {/* Use receiver_name from API */}
                    <TableCell>{shipment.receiver_name}</TableCell>
                    {/* service_type is fine as is if mapped correctly */}
                    <TableCell>{shipment.service_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[shipment.status])}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Use shipment.shipment_id_str for constructing the link */}
                      <Button asChild variant="outline" size="sm" disabled={!shipment.shipment_id_str || shipment.shipment_id_str === 'Unknown ID'}>
                        <Link href={shipment.shipment_id_str && shipment.shipment_id_str !== 'Unknown ID' ? `/dashboard/track-shipment?id=${shipment.shipment_id_str}` : '#'}>
                          <Eye className="mr-1 h-4 w-4" /> Track
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

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("block text-sm font-medium text-foreground mb-1", className)}
    {...props}
  />
));
Label.displayName = "Label";
