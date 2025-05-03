// src/ai/flows/pronunciation-feedback-flow.ts
'use server';
/**
 * @fileOverview Provides AI-powered pronunciation feedback using Genkit.
 *
 * - getPronunciationFeedback - Function to get feedback on recorded audio pronunciation.
 * - PronunciationInput - Input type for the feedback flow.
 * - PronunciationOutput - Output type for the feedback flow.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'zod'; // Ensure zod is imported

// Define the input schema for the pronunciation feedback flow
const PronunciationInputSchema = z.object({
  textToPractice: z.string().describe('The text the user was attempting to pronounce.'),
  audioDataUri: z
    .string()
    .describe(
      "The user's recorded audio pronunciation as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PronunciationInput = z.infer<typeof PronunciationInputSchema>;

// Define the output schema for the pronunciation feedback flow
const PronunciationOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('An overall pronunciation score out of 100.'),
  feedback: z.string().describe('General feedback on the pronunciation accuracy, clarity, and fluency.'),
  wordLevelFeedback: z.array(z.object({
      word: z.string(),
      isCorrect: z.boolean(),
      comment: z.string().optional().describe('Specific comment if the word was mispronounced.'),
  })).describe('Feedback on individual words or phonemes within the text.'),
  suggestions: z.array(z.string()).describe('Specific suggestions for improvement.'),
});
export type PronunciationOutput = z.infer<typeof PronunciationOutputSchema>;

// Define the Genkit prompt for pronunciation feedback
const pronunciationPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: { schema: PronunciationInputSchema },
  output: { schema: PronunciationOutputSchema },
  prompt: `You are an expert English pronunciation coach. Analyze the provided audio recording where a user attempts to pronounce the given text.

  Text to Practice:
  "{{{textToPractice}}}"

  User's Audio Recording:
  {{media url=audioDataUri}}

  Instructions:
  1. Listen carefully to the user's pronunciation in the audio.
  2. Compare it against the standard pronunciation of the provided text.
  3. Provide an overall score (0-100) based on accuracy, clarity, and fluency.
  4. Give constructive, specific feedback on the user's performance. Highlight strengths and areas for improvement.
  5. Analyze pronunciation at the word level. Identify specific words or sounds that were mispronounced and provide comments. Mark each analyzed word as correct or incorrect.
  6. Offer 2-3 actionable suggestions for the user to improve their pronunciation based on the analysis.

  Output the analysis strictly in the specified JSON format. Ensure all fields in the output schema are populated.`,
});

// Define the Genkit flow for pronunciation feedback
const pronunciationFeedbackFlow = ai.defineFlow<
  typeof PronunciationInputSchema,
  typeof PronunciationOutputSchema
>(
  {
    name: 'pronunciationFeedbackFlow',
    inputSchema: PronunciationInputSchema,
    outputSchema: PronunciationOutputSchema,
  },
  async (input) => {
    console.log('Received input for pronunciation feedback:', input.textToPractice); // Log input text
    try {
      // Check if 'ai.generate' exists and is a function before calling
      if (!ai || typeof ai.generate !== 'function') {
         throw new Error("Genkit AI instance is not properly initialized or generate function is missing.");
      }

      // Use the prompt object directly (it's awaitable)
      const { output } = await pronunciationPrompt(input);


      if (!output) {
          console.error("Pronunciation feedback prompt returned no output.");
          throw new Error('AI model did not return the expected feedback structure.');
      }

      console.log('Received output from AI:', output);

      // Basic validation (more robust validation can be added)
      if (typeof output.overallScore !== 'number' || !Array.isArray(output.suggestions)) {
          console.error("Invalid output structure received:", output);
          throw new Error('Received invalid output structure from AI.');
      }

      return output;
    } catch (error) {
        console.error('Error in pronunciationFeedbackFlow:', error);
        // Re-throw or handle error appropriately
         throw new Error(`Failed to get pronunciation feedback: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

/**
 * Wrapper function to call the pronunciation feedback flow.
 * @param input - The text and audio data URI.
 * @returns A promise that resolves to the pronunciation feedback.
 */
export async function getPronunciationFeedback(input: PronunciationInput): Promise<PronunciationOutput> {
  // Check if the flow function itself is valid before calling
  if (!pronunciationFeedbackFlow || typeof pronunciationFeedbackFlow !== 'function') {
    throw new Error("Pronunciation feedback flow is not properly defined or Genkit is not initialized.");
  }
  return pronunciationFeedbackFlow(input);
}
