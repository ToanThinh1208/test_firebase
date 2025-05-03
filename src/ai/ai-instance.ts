// src/ai/ai-instance.ts
import { genkit } from '@genkit-ai/core'; // Correct import for v1.x
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod'; // Keep zod import if needed for schemas defined here

// Check if the API key is available in environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
    console.warn(
        'GOOGLE_API_KEY environment variable is not set. Genkit AI features will be disabled or may fail.'
    );
}

// Initialize Genkit with the Google AI plugin using the correct v1.x syntax
export const ai = genkit({
    plugins: [
        googleAI({
             // Only provide apiKey if it exists, otherwise, the plugin might throw an error or use defaults
            apiKey: googleApiKey || undefined,
        }),
    ],
    logLevel: 'debug', // Set log level (e.g., 'debug', 'info')
    enableTracingAndMetrics: true, // Enable tracing and metrics
});

// Example of defining a schema (can be used in flows/prompts)
// export const ExampleSchema = z.object({ message: z.string() });
