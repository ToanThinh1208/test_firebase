# LinguaLeap

This is a Next.js starter app for LinguaLeap, an English learning platform, configured with Supabase for authentication and database operations, and Genkit for AI features.

To get started, take a look at src/app/page.tsx.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    *   Copy the `.env.example` file (if it exists) or create a new file named `.env` in the root directory.
    *   **Supabase:**
        *   Create a Supabase project at [https://supabase.com/dashboard/projects](https://supabase.com/dashboard/projects).
        *   In your Supabase project dashboard, navigate to **Project Settings** > **API**.
        *   Find your **Project URL** and your **anon public API key**.
        *   Add these to your `.env` file:
            ```dotenv
            NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
            NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
            ```
    *   **Google AI (for Genkit):**
        *   Obtain a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
        *   Add the key to your `.env` file:
            ```dotenv
            GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"
            ```
    *   Your completed `.env` file should look similar to this:
        ```dotenv
        # Supabase configuration
        NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"

        # Google AI API Key for Genkit
        GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"
        ```
    *   **Important:** Replace `"YOUR_..."` with your actual credentials.

3.  **Configure Supabase Database & Auth:**
    *   **Enable Email Provider & Check Confirmation:** Go to **Authentication** > **Providers** in your Supabase dashboard and enable the **Email** provider. **Crucially, ensure the "Confirm email" setting is ENABLED** if you want users to verify their email addresses after signing up. Disabling it allows instant login but is less secure.
    *   **Note on Email Delivery:** Supabase uses its own email service by default on the free plan, which might have limitations or land in spam/junk folders. For production, consider configuring a custom SMTP provider under **Authentication** > **Settings** > **SMTP Settings** for better deliverability.
    *   **Set up Database Schema:**
        *   Go to the **SQL Editor** in your Supabase dashboard.
        *   Click **New query**.
        *   Paste the following SQL commands to create the `profiles` table, enable Row Level Security (RLS), define access policies, and set up a trigger to automatically create a profile for new users:

            ```sql
            -- Create the profiles table
            CREATE TABLE public.profiles (
              id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              updated_at timestamp with time zone,
              username text UNIQUE,
              CONSTRAINT profiles_pkey PRIMARY KEY (id),
              CONSTRAINT username_length CHECK (char_length(username) >= 3)
            );

            -- Enable Row Level Security (RLS) for the profiles table
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

            -- Create policies for profiles table
            -- 1. Allow public read access for profiles
            CREATE POLICY "Public profiles are viewable by everyone."
            ON public.profiles FOR SELECT
            USING ( true );

            -- 2. Allow users to insert their own profile
            CREATE POLICY "Users can insert their own profile."
            ON public.profiles FOR INSERT
            WITH CHECK ( auth.uid() = id );

            -- 3. Allow users to update their own profile
            CREATE POLICY "Users can update own profile."
            ON public.profiles FOR UPDATE
            USING ( auth.uid() = id );

            -- Function to automatically create a profile entry when a new user signs up
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            SECURITY DEFINER SET search_path = public
            AS $$
            BEGIN
              INSERT INTO public.profiles (id, username)
              VALUES (new.id, new.email); -- Use email as initial username
              RETURN new;
            END;
            $$;

            -- Trigger to call the function after a new user is inserted into auth.users
            CREATE TRIGGER on_auth_user_created
              AFTER INSERT ON auth.users
              FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

            ```
        *   Click **Run** to execute the SQL commands.

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser.

5.  **(Optional) Generate Database Types:**
    If you modify your Supabase database schema (add tables, columns, etc.), regenerate TypeScript types for better type safety:
    ```bash
    npx supabase login # If not already logged in
    npx supabase gen types typescript --project-id hjujzczwypfbvimjndzr > src/lib/supabase/database.types.ts
    # The project ID hjujzczwypfbvimjndzr is pre-filled
    ```

## Features

*   Next.js with App Router
*   TypeScript
*   Tailwind CSS with ShadCN UI components
*   Supabase Authentication (Email/Password)
*   Supabase Database (Profiles table)
*   Genkit AI Integration (Pronunciation Feedback)
*   Interactive Lessons (Structure)
*   Pronunciation Practice (Recording & AI Feedback)
*   Quizzes (Structure)
*   User Profiles (View/Update Username)
*   Learner Dashboard
