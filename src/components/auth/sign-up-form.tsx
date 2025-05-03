
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
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null); // Use string for detailed message

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
    setConfirmationMessage(null); // Reset confirmation message

    // Get detailed message from signUp context function
    const { success, message, error: authError } = await signUp(values.email, values.password);
    setIsLoading(false); // Reset loading state

    if (success) {
       // Show the detailed message from the context
       setConfirmationMessage(message || 'Sign up process initiated. Please check your email (including spam/junk folders) for a confirmation link if required.');
       form.reset(); // Reset form fields
       toast({
         title: 'Sign Up Initiated',
         description: message || 'Please check your email for confirmation.',
       });
       // Don't redirect immediately, let the user see the confirmation message.
    } else {
       // Handle Supabase Auth errors
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (authError) {
           if (authError.message.includes('User already registered')) { // Supabase error message for existing user
                errorMessage = 'This email address is already registered.';
            } else if (authError.message.includes('Password should be at least 6 characters.')) { // Example Supabase weak password error
                 errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
            }
             // Add check for missing 'Confirm email' setting - heuristic based on error message
             else if (authError.message.includes('Unable to validate email address: invalid format') || authError.message.includes('Error sending confirmation mail')) {
                  errorMessage = 'Could not send confirmation email. Please double-check your email address or contact support. Ensure email confirmation is enabled in your project settings.';
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

    if (confirmationMessage) { // Check if there's a confirmation message to display
        return (
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
                     <CardDescription className="text-center flex flex-col items-center gap-4 pt-4">
                         <CheckCircle className="h-12 w-12 text-green-500" />
                         {/* Display the detailed confirmation message */}
                         {confirmationMessage}
                    </CardDescription>
                </CardHeader>
                 <CardFooter className="flex justify-center text-sm pt-6">
                    <p className="text-muted-foreground">
                      Already confirmed or having trouble?{' '}
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
