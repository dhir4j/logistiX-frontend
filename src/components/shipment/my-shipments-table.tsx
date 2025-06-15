"use client";

import React, { useState, useMemo } from 'react';
import { useShipments } from '@/hooks/use-shipments';
import type { Shipment, TrackingStage } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { PackageSearch, Filter, CalendarDays, ListFilter, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

const statusColors: Record<TrackingStage, string> = {
  Booked: "bg-blue-100 text-blue-700 border-blue-300",
  "In Transit": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};

export function MyShipmentsTable() {
  const { shipments, isLoading } = useShipments();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredShipments = useMemo(() => {
    return shipments
      .filter(shipment => {
        const statusMatch = filterStatus === 'all' || shipment.status === filterStatus;
        const dateMatch = !filterDate || format(shipment.bookingDate, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd');
        const searchMatch = searchTerm === '' || 
                            shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            shipment.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            shipment.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && dateMatch && searchMatch;
      })
      .sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime());
  }, [shipments, filterStatus, filterDate, searchTerm]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><PackageSearch className="h-12 w-12 animate-pulse text-primary" /></div>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
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
                  <SelectItem value="Booked">Booked</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
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

        {filteredShipments.length === 0 ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium text-primary">{shipment.id}</TableCell>
                    <TableCell>{format(shipment.bookingDate, 'dd MMM yyyy')}</TableCell>
                    <TableCell>{shipment.senderName}</TableCell>
                    <TableCell>{shipment.receiverName}</TableCell>
                    <TableCell>{shipment.serviceType}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[shipment.status])}>
                        {shipment.status}
                      </Badge>
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

// Helper Label component for form elements, if not using shadcn/FormLabel
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
