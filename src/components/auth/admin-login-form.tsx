
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, KeyRound } from 'lucide-react';
import Image from 'next/image';

const adminLoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { adminLogin } = useAdminAuth();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: AdminLoginFormValues) => {
    setError(null);
    if (data.username === 'admin' && data.password === 'admin') {
      adminLogin(data.username);
      router.replace('/admin/dashboard');
    } else {
      setError('Invalid username or password.');
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
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Username</FormLabel>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        placeholder="admin" 
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
        <p className="text-xs text-muted-foreground text-center w-full">Enter credentials to access the admin dashboard.</p>
      </CardFooter>
    </Card>
  );
}
