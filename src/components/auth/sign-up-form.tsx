
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation'; // Use next/navigation
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'; // Import Loader2 and CheckCircle

// Schema with password confirmation
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error applies to the confirmPassword field
});


export function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false); // State for confirmation message

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null); // Clear previous errors
    setIsLoading(true); // Set loading state
    setShowConfirmationMessage(false); // Reset confirmation message

    const { success, error: authError } = await signUp(values.email, values.password);
    setIsLoading(false); // Reset loading state

    if (success) {
       // Check if Supabase requires email confirmation (this depends on your Supabase settings)
       // For now, we assume confirmation might be needed and show a generic success message.
       setShowConfirmationMessage(true); // Show confirmation message instead of redirecting immediately
       form.reset(); // Reset form fields
      toast({
        title: 'Account Creation Pending',
        description: 'Please check your email to confirm your account.',
      });
       // Don't redirect immediately, let the user see the confirmation message.
       // router.push('/');
    } else {
       // Handle Supabase Auth errors
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (authError) {
           if (authError.message.includes('User already registered')) { // Supabase error message for existing user
                errorMessage = 'This email address is already registered.';
            } else if (authError.message.includes('Password should be at least 6 characters.')) { // Example Supabase weak password error
                 errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
            }
            // Add more specific Supabase error checks if needed
             else {
                 errorMessage = `Sign up failed: ${authError.message}`;
                 console.error("Unhandled Supabase sign-up error:", authError.message);
             }
        }
       setError(errorMessage);
        toast({
            title: 'Sign Up Failed',
            description: errorMessage,
            variant: 'destructive',
        });
    }
  }

    if (showConfirmationMessage) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
                     <CardDescription className="text-center flex flex-col items-center gap-4">
                         <CheckCircle className="h-12 w-12 text-green-500" />
                        We've sent a confirmation link to your email address. Please click the link to activate your account.
                    </CardDescription>
                </CardHeader>
                 <CardFooter className="flex justify-center text-sm">
                    <p className="text-muted-foreground">
                      Already confirmed?{' '}
                      <Link href="/login" className="text-primary hover:underline">
                        Log In
                      </Link>
                    </p>
                  </CardFooter>
            </Card>
        );
    }


  return (
     <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Enter your details to sign up for LinguaLeap.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
