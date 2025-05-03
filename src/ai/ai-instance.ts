// src/ai/ai-instance.ts
import { genkit } from '@genkit-ai/core'; // Use named import for genkit v1.x
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod'; // Keep zod import if needed for schemas defined elsewhere

// Check if the API key is available in environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
    console.warn(
        'GOOGLE_API_KEY environment variable is not set. Genkit AI features will be disabled or may fail.'
    );
    // Optionally, you could throw an error here if the key is absolutely required
    // throw new Error('Missing GOOGLE_API_KEY environment variable.');
}

// Define plugins array conditionally based on API key presence
const plugins = [];
if (googleApiKey) {
    plugins.push(googleAI({ apiKey: googleApiKey }));
} else {
    console.warn('Google AI plugin not configured because GOOGLE_API_KEY is missing.');
    // Depending on requirements, you might want to throw an error or proceed without the plugin
    // For now, we proceed without the plugin if the key is missing.
}


// Initialize Genkit with the Google AI plugin using the correct v1.x syntax
// Ensure genkit is called as a function with the configuration object
let aiInstance;
try {
     // Only initialize genkit if there are plugins to use (e.g., API key was provided)
     // Or adjust this logic if genkit should run even without plugins
    if (plugins.length > 0) {
        aiInstance = genkit({ // This should now work with the named import
            plugins: plugins,
            logLevel: 'debug', // Set log level (e.g., 'debug', 'info')
            enableTracingAndMetrics: true, // Enable tracing and metrics
        });
    } else {
        // Handle the case where genkit cannot be initialized (e.g., due to missing plugins/config)
        // Option 1: Throw an error
        // throw new Error("Cannot initialize Genkit without required plugins/configuration.");
        // Option 2: Create a dummy/noop 'ai' object to prevent runtime errors elsewhere
         console.error("Genkit initialization skipped due to missing configuration (e.g., API key). AI features will not work.");
         aiInstance = { // Dummy object matching expected structure if possible
             defineFlow: () => { throw new Error("Genkit not initialized"); },
             definePrompt: () => { throw new Error("Genkit not initialized"); },
             generate: async () => { throw new Error("Genkit not initialized"); },
             // Add other methods used in your flows if necessary
         };
    }

} catch (e) {
    console.error("Failed to initialize genkit:", e);
    // Provide a fallback or re-throw to make the error clearer
    throw new Error(`Genkit initialization failed: ${e instanceof Error ? e.message : String(e)}. Check previous logs and Genkit setup.`);
}

// Export the potentially initialized instance
export const ai = aiInstance;


// Example of defining a schema (can be used in flows/prompts)
// export const ExampleSchema = z.object({ message: z.string() });
