
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { AdminUserDetailsResponse, UserShipmentSummary, UserPayment, TrackingStage } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertTriangle, User, Mail, Calendar, ArrowLeft, Package, Wallet, IndianRupee, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<TrackingStage, string> = {
  "Pending Payment": "bg-gray-100 text-gray-700 border-gray-300",
  Booked: "bg-blue-100 text-blue-700 border-blue-300",
  "In Transit": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};

export function AdminUserDetails({ userId }: { userId: number }) {
  const [details, setDetails] = useState<AdminUserDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const { logoutUser } = useAuth();
  const router = useRouter();

  const handleApiError = useCallback((err: any, operation: string) => {
    console.error(`API error during ${operation}:`, err);
    const errorMessage = err?.data?.error || err.message || "An unexpected error occurred.";
    if (err.status === 422) {
      toast({
        title: "Authentication Issue",
        description: "Your session may have expired. Please log in again.",
        variant: "destructive",
      });
      logoutUser();
      router.replace('/login');
    } else {
      setError(errorMessage);
    }
  }, [toast, logoutUser, router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient<AdminUserDetailsResponse>(`/api/admin/users/${userId}`);
        setDetails(data);
      } catch (err: any) {
        handleApiError(err, 'fetching user details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, handleApiError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading User Details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Error Loading User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!details) {
    return null;
  }

  const { user, shipments, payments } = details;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-headline font-bold text-primary">User Details</h1>
             <Button variant="outline" onClick={() => router.push('/admin/users')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to User List
            </Button>
        </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><User /> {user.first_name} {user.last_name}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Joined:</span>
            <span>{format(parseISO(user.created_at), 'dd MMM, yyyy')}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package /> Shipments ({shipments.length})</CardTitle>
          <CardDescription>A list of all shipments created by this user.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.length > 0 ? shipments.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-primary">{s.shipment_id_str}</TableCell>
                    <TableCell>{format(parseISO(s.booking_date), 'dd MMM, yyyy')}</TableCell>
                    <TableCell>{s.receiver_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[s.status])}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      <IndianRupee className="h-3 w-3" /> {s.total_with_tax_18_percent.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No shipments found for this user.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet /> Payments ({payments.length})</CardTitle>
          <CardDescription>A list of all payment submissions by this user.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-primary">{p.shipment_id_str}</TableCell>
                    <TableCell>{format(parseISO(p.created_at), 'dd MMM, yyyy')}</TableCell>
                    <TableCell>{p.utr}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[p.status as keyof typeof statusColors] || "bg-gray-100")}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      <IndianRupee className="h-3 w-3" /> {p.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No payment records found for this user.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
