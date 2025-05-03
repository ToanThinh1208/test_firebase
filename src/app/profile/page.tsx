// src/app/profile/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getProfile, updateProfile } from '@/services/profile-service';
import { Loader2, User, Mail, Save } from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const profileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(50, { message: "Username cannot exceed 50 characters." }).nullable(),
  // email is read-only for display purposes
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
    },
  });

  const fetchProfileData = useCallback(async () => {
    if (!currentUser) return;
    setLoadingProfile(true);
    try {
      const data = await getProfile(currentUser.id);
      if (data) {
        setProfile(data);
        form.reset({ username: data.username || '' }); // Reset form with fetched data
      } else {
          // If no profile exists, initialize form with empty username or default based on email
          const defaultUsername = currentUser.email?.split('@')[0] || '';
          form.reset({ username: defaultUsername });
          // Optionally, create the profile row if it doesn't exist upon loading
          await updateProfile(currentUser.id, { username: defaultUsername });
          setProfile({ id: currentUser.id, username: defaultUsername, updated_at: new Date().toISOString() }); // Update local state
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [currentUser, form, toast]);


  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login'); // Redirect if not logged in
    } else if (currentUser) {
        fetchProfileData();
    }
  }, [currentUser, authLoading, router, fetchProfileData]);

  const onSubmit = async (values: ProfileFormData) => {
    if (!currentUser) return;

    setIsSaving(true);
    const updates = {
      username: values.username,
      // id: currentUser.id, // id is included in updateProfile service call implicitly by userId parameter
    };

    // Ensure username is not empty or only whitespace before saving, unless null is intended
    if (typeof updates.username === 'string' && updates.username.trim() === '') {
         updates.username = null; // Store as null if empty or whitespace
    }


    const { success, error } = await updateProfile(currentUser.id, updates);

    setIsSaving(false);

    if (success) {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        variant: 'default',
      });
      // Optionally re-fetch profile data to confirm update
      fetchProfileData();
    } else {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error?.message || 'An error occurred while updating your profile.',
        variant: 'destructive',
      });
    }
  };


   if (authLoading || loadingProfile || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and update your profile details.</CardDescription>
        </CardHeader>
        <CardContent>
           {/* Display Email (Read-only) */}
           <div className="mb-6">
              <Label htmlFor="email">Email</Label>
               <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-muted text-muted-foreground">
                  <Mail className="h-5 w-5" />
                  <span>{currentUser.email}</span>
              </div>
               <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here.</p>
           </div>

          {/* Update Username Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="username" className="flex items-center gap-2">
                        <User className="h-5 w-5" /> Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        {...field}
                        value={field.value ?? ''} // Handle null value from DB
                        onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)} // Send null if empty
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                   <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                   </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter>
             <p className="text-xs text-muted-foreground">
                 Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}
             </p>
         </CardFooter>
      </Card>
    </div>
  );
}
