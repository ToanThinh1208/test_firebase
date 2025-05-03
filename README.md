# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable Email/Password authentication in the Firebase console (Authentication -> Sign-in method).
    *   Find your Firebase project configuration settings (Project settings -> General -> Your apps -> Web app -> SDK setup and configuration -> Config).
    *   Copy the `.env.example` file (if it exists) or create a new file named `.env` in the root directory.
    *   Populate the `.env` file with your Firebase project credentials. It should look like this:

        ```dotenv
        # Firebase App configuration (replace with your actual values)
        NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID" # Optional
        ```
    *   **Important:** Replace `"YOUR_..."` with your actual Firebase credentials.

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser.

## Features

*   Next.js with App Router
*   TypeScript
*   Tailwind CSS with ShadCN UI components
*   Firebase Authentication (Email/Password)
*   Interactive Lessons
*   Pronunciation Practice (recording only, no AI feedback yet)
*   Quizzes
