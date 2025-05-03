# LinguaLeap

This is a Next.js starter app for LinguaLeap, an English learning platform, configured with Supabase for authentication and potentially database operations.

To get started, take a look at src/app/page.tsx.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Supabase:**
    *   Create a Supabase project at [https://supabase.com/dashboard/projects](https://supabase.com/dashboard/projects).
    *   In your Supabase project dashboard, navigate to **Project Settings** > **API**.
    *   Find your **Project URL** and your **anon public API key**.
    *   Copy the `.env.example` file (if it exists) or create a new file named `.env` in the root directory.
    *   Populate the `.env` file with your Supabase credentials. It should look like this:

        ```dotenv
        # Supabase configuration
        NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"

        # Optional: Keep Firebase variables if used elsewhere, otherwise remove
        # NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
        # ... other Firebase vars
        ```
    *   **Important:** Replace `"YOUR_..."` with your actual Supabase URL and anon key.
    *   **Enable Email Provider:** Go to **Authentication** > **Providers** in your Supabase dashboard and enable the **Email** provider. You might want to disable **Confirm email** during development for easier testing, but remember to enable it for production.

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser.

4.  **(Optional) Generate Database Types:**
    If you add tables to your Supabase database, generate TypeScript types for better type safety:
    ```bash
    npx supabase login # If not already logged in
    npx supabase gen types typescript --project-id <your-project-ref> > src/lib/supabase/database.types.ts
    # Replace <your-project-ref> with your actual Supabase project reference ID
    ```

## Features

*   Next.js with App Router
*   TypeScript
*   Tailwind CSS with ShadCN UI components
*   Supabase Authentication (Email/Password)
*   Interactive Lessons (Structure)
*   Pronunciation Practice (Recording only)
*   Quizzes (Structure)
