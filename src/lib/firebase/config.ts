
// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Check if essential config keys are missing or are still the placeholder values
if (
    !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" ||
    !firebaseConfig.authDomain || firebaseConfig.authDomain === "YOUR_AUTH_DOMAIN" ||
    !firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID"
   ) {
    console.error(
        "Firebase configuration is missing or incomplete. " +
        "Please ensure your .env file has the correct NEXT_PUBLIC_FIREBASE_* variables set " +
        "with your actual Firebase project credentials. Do not use the placeholder values."
        );
    // Depending on the desired behavior, you might want to throw an error here
    // or disable Firebase-dependent features. Logging is the least disruptive option.
}


// Initialize Firebase
// Check if Firebase app already exists to avoid reinitialization errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// const db = getFirestore(app); // Uncomment if you need Firestore
// const storage = getStorage(app); // Uncomment if you need Storage

export { app, auth };
// export { app, auth, db, storage }; // Export db and storage if needed
