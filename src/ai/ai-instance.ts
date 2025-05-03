// src/ai/ai-instance.ts
// Removed 'use server' directive as this file primarily sets up and exports the AI instance, not Server Actions directly.
// Flows that import 'ai' should retain their 'use server' directive.

import { genkit } from '@genkit-ai/core'; // Correct: Use named import for genkit v1.x
import { googleAI } from '@genkit-ai/googleai';
// Zod might still be needed if schemas are defined and used *within* this file for configuration,
// but typically schemas are defined in the flow files. Remove if unused.
// import { z } from 'zod';

// Check if the API key is available in environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

let aiInstance: any; // Use 'any' for flexibility in assigning either real or dummy object

if (!googleApiKey) {
    console.warn(
        'GOOGLE_API_KEY environment variable is not set. Genkit AI features will be disabled.'
    );
    // Create a dummy 'ai' object that throws errors if used
    aiInstance = {
        defineFlow: (): never => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        definePrompt: (): never => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        defineTool: (): never => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        generate: async (): Promise<never> => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
        generateStream: (): never => { throw new Error("Genkit not initialized: GOOGLE_API_KEY is missing."); },
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
             defineFlow: (): never => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             definePrompt: (): never => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             defineTool: (): never => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             generate: async (): Promise<never> => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             generateStream: (): never => { throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}`); },
             // Add other methods if necessary
         };
    }
}

// Export the initialized instance or the dummy object
export const ai = aiInstance;

// Removed the ExampleSchema export as it violates 'use server' rules if the directive were present,
// and schemas are typically defined within the flow files that use them.
// export const ExampleSchema = z.object({ message: z.string() });
