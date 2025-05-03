// src/lib/supabase/client.ts
'use client'; // Mark as client component module

// Import from the core supabase-js library
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types'; // Adjust path if your types file is elsewhere

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// More explicit check for URL validity
let isValidUrl = false;
if (supabaseUrl) {
  try {
    new URL(supabaseUrl); // Attempt to construct URL to check validity
    isValidUrl = true;
  } catch (_) {
    // If new URL() throws, the URL is invalid
    isValidUrl = false;
  }
}

if (!supabaseUrl || !isValidUrl) { // Check if URL is missing OR invalid
  // Throw a more specific error if the URL is the problem
  console.error(`Supabase URL Check Failed. Value received: "${supabaseUrl}"`);
  throw new Error(`Missing or invalid environment variable: NEXT_PUBLIC_SUPABASE_URL.`);
}
if (!supabaseAnonKey) {
   console.error("Supabase Anon Key Check Failed.");
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create a Supabase client using the core library
// This client can be used in 'use client' components.
// For server-side, a different setup (like createServerClient from @supabase/ssr) is needed.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
