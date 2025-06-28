"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { AdminPayment, PaymentStatus, UpdatePaymentStatusResponse } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { IndianRupee, Wallet, PackageSearch, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const statusColors: Record<PaymentStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Approved: "bg-green-100 text-green-700 border-green-300",
  Rejected: "bg-red-100 text-red-700 border-red-300",
};

export function AdminPaymentsTable() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
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

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated || !user?.isAdmin) {
      setPayments([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient<AdminPayment[]>(`/api/admin/payments`);
      setPayments(data);
    } catch (error: any) {
      handleApiError(error, 'fetching payments');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, handleApiError]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleUpdateStatus = async (paymentId: number, status: 'Approved' | 'Rejected') => {
    try {
      await apiClient<UpdatePaymentStatusResponse>(`/api/admin/payments/${paymentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      toast({
        title: "Success",
        description: `Payment ID ${paymentId} has been ${status.toLowerCase()}.`,
      });
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p));
    } catch (error) {
      handleApiError(error, `updating payment ${paymentId}`);
    }
  };

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading payment requests...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl sm:text-3xl flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" /> Payment Submissions
        </CardTitle>
        <CardDescription>Review and process pending payment submissions.</CardDescription>
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
            <p className="text-xl font-semibold text-muted-foreground">No Payment Requests Found</p>
            <p className="text-sm text-muted-foreground">Pending submissions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>UTR Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-primary">{payment.order_id}</TableCell>
                    <TableCell>{payment.first_name} {payment.last_name}</TableCell>
                    <TableCell className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                      {payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{payment.utr}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[payment.status])}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(payment.created_at), 'dd MMM yyyy, HH:mm')}</TableCell>
                    <TableCell className="text-center">
                      {payment.status === 'Pending' ? (
                        <div className="flex gap-2 justify-center">
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:text-green-800">
                                <CheckCircle className="mr-1 h-4 w-4" /> Approve
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approve Payment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will mark payment ID {payment.id} (UTR: {payment.utr}) as approved and book the associated shipment. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUpdateStatus(payment.id, 'Approved')} className="bg-green-600 hover:bg-green-700">
                                  Confirm Approval
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:text-red-800">
                                <XCircle className="mr-1 h-4 w-4" /> Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Payment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will mark payment ID {payment.id} (UTR: {payment.utr}) as rejected. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUpdateStatus(payment.id, 'Rejected')} className="bg-destructive hover:bg-destructive/90">
                                  Confirm Rejection
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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
