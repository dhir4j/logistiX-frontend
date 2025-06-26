
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { UserPayment, PaymentStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Wallet, IndianRupee, PackageSearch, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const statusColors: Record<PaymentStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Approved: "bg-green-100 text-green-700 border-green-300",
  Rejected: "bg-red-100 text-red-700 border-red-300",
};

export function MyPaymentsTable() {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, logoutUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    const errorMessage = error?.data?.error || error.message || "An unexpected error occurred.";
    if (error.status === 422) {
        toast({
            title: "Authentication Issue",
            description: "Your session may have expired. Please log in again.",
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

  const fetchUserPayments = useCallback(async () => {
    if (!isAuthenticated || !user?.email) {
      setPayments([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient<UserPayment[]>(`/api/user/payments?email=${encodeURIComponent(user.email)}`);
      setPayments(data.sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()));
    } catch (error: any) {
      handleApiError(error, 'fetching user payments');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, handleApiError]);

  useEffect(() => {
    fetchUserPayments();
  }, [fetchUserPayments]);

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading payments...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" /> My Payments
        </CardTitle>
        <CardDescription>View the status of your UTR submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && payments.length > 0 && (
             <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Refreshing data...
            </div>
        )}

        {!isLoading && payments.length === 0 ? (
          <div className="text-center py-12">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No Payments Found</p>
            <p className="text-sm text-muted-foreground">Your payment submissions will appear here after booking a shipment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>UTR Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-primary">{payment.shipment_id_str}</TableCell>
                    <TableCell>{payment.utr}</TableCell>
                    <TableCell className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                      {payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[payment.status])}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(payment.created_at), 'dd MMM yyyy, HH:mm')}</TableCell>
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
