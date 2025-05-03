// src/services/profile-service.ts
'use server'; // Mark as server action

// Use createServerActionClient for server-side operations within Server Actions
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';
import type { PostgrestError } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Fetches the user profile from the 'profiles' table using a server client.
 *
 * @param userId - The ID of the user whose profile is to be fetched.
 * @returns A promise that resolves to the user's profile or null if not found or an error occurred.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
    if (!userId) {
        console.error('User ID is required to fetch profile.');
        return null;
    }

    // Create a Supabase client for server actions
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        const { data, error, status } = await supabase
            .from('profiles')
            .select(`*`)
            .eq('id', userId)
            .single(); // Use single() to get one record or null

        // Log error only if it's not a "No rows found" error (status 406)
        if (error && status !== 406) {
             console.error('Error fetching profile:', error);
             return null;
        }

        return data; // Returns the profile data or null if not found
    } catch (error) {
        console.error('Unexpected error in getProfile service:', error);
        return null;
    }
}

/**
 * Updates (or creates if it doesn't exist) a user profile in the 'profiles' table using a server client.
 *
 * @param userId - The ID of the user whose profile is to be updated/created.
 * @param updates - An object containing the profile fields to update.
 * @returns A promise that resolves to an object indicating success or failure, with an optional error.
 */
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<{ success: boolean; error?: PostgrestError | Error | null }> {
     if (!userId) {
        return { success: false, error: new Error('User ID is required to update profile.') };
    }

     // Create a Supabase client for server actions
    const supabase = createServerActionClient<Database>({ cookies });


    // Ensure 'updated_at' is set for the update operation
    const profileDataWithTimestamp = {
        ...updates,
        id: userId, // Ensure the id is part of the object being upserted
        updated_at: new Date().toISOString(),
    };

    try {
        // Use upsert: updates if profile exists, inserts if it doesn't
        // Set `defaultToNull: false` to prevent overwriting existing fields with null if they are not provided in `updates`
        const { error } = await supabase
            .from('profiles')
            .upsert(profileDataWithTimestamp, { onConflict: 'id', defaultToNull: false }) // Ensure `id` is the conflict column, prevent null overwrites
            .select(); // Select to check the result, returns the upserted row(s)

        if (error) {
            console.error('Error updating profile:', error);
            return { success: false, error };
        }

        return { success: true }; // Successfully upserted
    } catch (error) {
         console.error('Unexpected error in updateProfile service:', error);
        // Ensure the caught error is of type Error before returning
        const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
        return { success: false, error: errorObj };
    }
}
