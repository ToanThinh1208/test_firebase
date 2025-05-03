
'use server';
/**
 * @fileOverview Provides AI-driven pronunciation feedback.
 *
 * - getPronunciationFeedback - Analyzes user audio against text for pronunciation accuracy.
 * - PronunciationInput - Input schema for the pronunciation flow.
 * - PronunciationOutput - Output schema containing feedback details.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// --- Input Schema ---
const PronunciationInputSchema = z.object({
  textToPronounce: z.string().describe('The text the user was supposed to pronounce.'),
  audioDataUri: z
    .string()
    .describe(
      "The user's recorded audio pronunciation as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PronunciationInput = z.infer<typeof PronunciationInputSchema>;


// --- Output Schema ---
const WordScoreSchema = z.object({
    word: z.string().describe('The specific word being scored.'),
    score: z.number().int().min(0).max(100).describe('Pronunciation score for the word (0-100).'),
    // Optional: Add phoneme breakdown or specific error type later
});

const PronunciationOutputSchema = z.object({
  overallScore: z.number().int().min(0).max(100).describe('An overall pronunciation score from 0 to 100.'),
  overallAssessment: z.string().describe('A brief textual assessment (e.g., "Excellent", "Good", "Needs Improvement").'),
  wordScores: z.array(WordScoreSchema).optional().describe('Scores for individual words in the pronounced text.'),
  suggestions: z.array(z.string()).optional().describe('Specific suggestions for improvement.'),
});
export type PronunciationOutput = z.infer<typeof PronunciationOutputSchema>;


// --- Define Prompt ---
const pronunciationPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: { schema: PronunciationInputSchema },
  output: { schema: PronunciationOutputSchema },
  prompt: `Analyze the provided audio recording of a user pronouncing the given text. Evaluate the pronunciation accuracy and provide feedback.

Text to Pronounce:
"{{{textToPronounce}}}"

User's Audio Recording:
{{media url=audioDataUri}}

Your Task:
1.  **Overall Score:** Provide an overall score from 0 (very poor) to 100 (native-like).
2.  **Overall Assessment:** Give a one-sentence qualitative assessment (e.g., "Excellent pronunciation", "Good effort, some sounds need work", "Significant improvement needed").
3.  **Word Scores (Optional but Recommended):** If possible, break down the score for key words or problematic words. Score each word from 0 to 100.
4.  **Suggestions:** Provide 1-3 specific, actionable suggestions for improvement, focusing on the most critical errors (e.g., "Focus on the 'th' sound in 'the'", "Practice the vowel sound in 'cat'"). If pronunciation is excellent, say so.

Be concise and encouraging. Structure your response according to the output schema.
`,
});


// --- Define Flow ---
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

     // Basic input validation
     if (!input.textToPronounce.trim()) {
       throw new Error("Text to pronounce cannot be empty.");
     }
     if (!input.audioDataUri || !input.audioDataUri.startsWith('data:audio/')) {
       throw new Error("Invalid audio data URI provided.");
     }

    console.log(`[pronunciationFeedbackFlow] Processing text: "${input.textToPronounce}"`);
    try {
       const llmResponse = await pronunciationPrompt(input);
       const output = llmResponse.output;

       if (!output) {
         console.error("[pronunciationFeedbackFlow] LLM returned no output.");
         throw new Error("AI failed to generate feedback.");
       }

       console.log("[pronunciationFeedbackFlow] Feedback generated successfully.");
       // Ensure required fields are present, provide defaults if necessary (though schema should guide LLM)
       output.overallScore = output.overallScore ?? 0;
       output.overallAssessment = output.overallAssessment ?? "Assessment unavailable.";

       return output;

    } catch (error) {
        console.error("[pronunciationFeedbackFlow] Error during AI processing:", error);
         // Rethrow a more specific error or handle appropriately
         if (error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("AI service is busy or rate limited. Please try again later.");
         }
         if (error instanceof Error && error.message.includes('safety') ) {
             throw new Error("The provided audio or text could not be processed due to safety settings.");
         }
        throw new Error(`Failed to get pronunciation feedback from AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

// --- Exported Function ---
/**
 * Analyzes user audio against text for pronunciation accuracy using Genkit.
 * @param input The text and audio data URI.
 * @returns A promise resolving to the pronunciation feedback.
 */
export async function getPronunciationFeedback(input: PronunciationInput): Promise<PronunciationOutput> {
  return pronunciationFeedbackFlow(input);
}
