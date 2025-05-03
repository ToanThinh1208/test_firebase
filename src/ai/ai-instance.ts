// src/ai/ai-instance.ts
'use server'; // Add server directive as this might be used by server components/actions

import { genkit } from '@genkit-ai/core'; // Correct: Use named import for genkit v1.x
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod'; // Keep zod import if needed for schemas defined elsewhere

// Check if the API key is available in environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

let aiInstance: any; // Use 'any' for flexibility in assigning either real or dummy object

if (!googleApiKey) {
    console.warn(
        'GOOGLE_API_KEY environment variable is not set. Genkit AI features will be disabled.'
    );
    // Create a dummy 'ai' object that throws errors if used
    aiInstance = {
        defineFlow: () => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        definePrompt: () => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        defineTool: () => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        generate: async () => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        generateStream: () => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        // Add other Genkit methods used in your application here, all throwing an error.
    };

} else {
    // Initialize Genkit properly only if the API key exists
    try {
        aiInstance = genkit({
            plugins: [googleAI({ apiKey: googleApiKey })],
            logLevel: 'debug', // Set log level (e.g., 'debug', 'info')
            enableTracingAndMetrics: true, // Enable tracing and metrics
        });
        console.log("Genkit initialized successfully with Google AI plugin.");
    } catch (e) {
        console.error("Failed to initialize Genkit even with API key:", e);
        // Provide a fallback dummy object in case initialization fails unexpectedly
         aiInstance = {
             defineFlow: () => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             definePrompt: () => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             defineTool: () => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             generate: async () => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             generateStream: () => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             // Add other methods if necessary
         };
    }
}

// Export the initialized instance or the dummy object
export const ai = aiInstance;

// Example of defining a schema (can be used in flows/prompts) - Removed as it causes 'use server' error
// export const ExampleSchema = z.object({ message: z.string() });
