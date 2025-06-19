
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const adminLoginSchema = z.object({
  email: z.string().email({ message: "Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { loginUser, user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '', // Example: 'admin@example.com'
      password: '', // Example: 'adminpassword'
    },
  });

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [user, isAuthenticated, isLoading, router]);


  const onSubmit = async (data: AdminLoginFormValues) => {
    setApiError(null);
    form.clearErrors();
    try {
      const loggedInUser = await loginUser(data.email, data.password);
      if (loggedInUser.isAdmin) {
        toast({
          title: "Admin Login Successful",
          description: `Welcome, ${loggedInUser.firstName}!`,
        });
        router.replace('/admin/dashboard');
      } else {
        // Logged in successfully but not an admin
        setApiError('Access denied. User is not an administrator.');
        toast({
            title: "Login Failed",
            description: "You do not have admin privileges.",
            variant: "destructive",
        });
        // Optionally, log them out if they shouldn't stay logged in as a regular user here
        // logoutUser(); 
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || "An unexpected error occurred.";
      setApiError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl bg-card text-card-foreground border-primary/50">
      <CardHeader className="items-center text-center">
        <Image src="/images/brand.png" alt="Shed Load Overseas Admin" width={180} height={45} className="object-contain mb-4" />
        <CardTitle className="font-headline text-2xl sm:text-3xl text-primary">Admin Panel</CardTitle>
        <CardDescription className="text-muted-foreground">Access the control center.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="admin@example.com" 
                        {...field} 
                        className="pl-10 text-base" 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="pl-10 text-base"
                        />
                      </FormControl>
                    </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">Enter admin credentials to access the dashboard.</p>
      </CardFooter>
    </Card>
  );
}
