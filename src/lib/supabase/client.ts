// src/lib/supabase/client.ts
'use client'; // Mark as client component module

import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types'; // Adjust path if your types file is elsewhere

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create a Supabase client for client-side usage
// Note: For server-side operations (Server Components, Route Handlers, Server Actions),
// you might need a different client setup (e.g., using createServerClient).
// This browser client is suitable for usage within 'use client' components and contexts.
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
