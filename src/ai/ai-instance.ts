// src/ai/ai-instance.ts
import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

// Check if the API key is available in environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
    console.warn(
        'GOOGLE_API_KEY environment variable is not set. Genkit AI features will be disabled or may fail.'
    );
}

// Initialize Genkit with the Google AI plugin
// Only include the plugin if the API key exists
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
// import { z } from 'zod';
// export const ExampleSchema = z.object({ message: z.string() });
