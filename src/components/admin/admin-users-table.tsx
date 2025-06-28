
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { AdminUserListItem, AdminUsersResponse } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, PackageSearch, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const { isAuthenticated, logoutUser } = useAuth();
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

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      if (search) params.set('q', search);

      const response = await apiClient<AdminUsersResponse>(`/api/admin/users?${params.toString()}`);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      handleApiError(error, 'fetching users');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleApiError]);

  useEffect(() => {
    fetchUsers(1, searchTerm);
  }, [searchTerm, fetchUsers]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>All Users ({totalCount})</CardTitle>
        <CardDescription>Browse and manage all registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearchSubmit} className="mb-6 p-4 border rounded-lg bg-muted/50 flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </form>

        {isLoading && users.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-2">Loading users...</p>
          </div>
        )}

        {!isLoading && users.length === 0 ? (
          <div className="text-center py-12">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No Users Found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined On</TableHead>
                    <TableHead className="text-center">Shipments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{format(parseISO(user.created_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="text-center">{user.shipment_count}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
