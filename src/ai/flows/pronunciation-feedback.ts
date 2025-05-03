'use server';

/**
 * @fileOverview Provides personalized feedback on English pronunciation.
 *
 * - pronunciationFeedback - A function that provides pronunciation feedback.
 * - PronunciationFeedbackInput - The input type for the pronunciationFeedback function.
 * - PronunciationFeedbackOutput - The return type for the pronunciationFeedback function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PronunciationFeedbackInputSchema = z.object({
  text: z.string().describe('The English text to be pronounced.'),
  audioDataUri: z
    .string()
    .describe(
      'The audio recording of the user pronouncing the text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type PronunciationFeedbackInput = z.infer<typeof PronunciationFeedbackInputSchema>;

const PronunciationFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback on the user\'s pronunciation, including suggestions for improvement.'),
});
export type PronunciationFeedbackOutput = z.infer<typeof PronunciationFeedbackOutputSchema>;

export async function pronunciationFeedback(input: PronunciationFeedbackInput): Promise<PronunciationFeedbackOutput> {
  return pronunciationFeedbackFlow(input);
}

const pronunciationFeedbackPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The English text to be pronounced.'),
      audioDataUri: z
        .string()
        .describe(
          'The audio recording of the user pronouncing the text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
        ),
    }),
  },
  output: {
    schema: z.object({
      feedback: z.string().describe('Personalized feedback on the user\'s pronunciation, including suggestions for improvement.'),
    }),
  },
  prompt: `You are an AI pronunciation coach. A user is trying to pronounce the following text:\n\n{{text}}\n\nYou have received an audio recording of their attempt. Please provide specific and actionable feedback to help them improve their pronunciation. Focus on areas where they can improve their clarity and accuracy. Be encouraging and supportive.\n\nAudio: {{media url=audioDataUri}}`,
});

const pronunciationFeedbackFlow = ai.defineFlow<
  typeof PronunciationFeedbackInputSchema,
  typeof PronunciationFeedbackOutputSchema
>({
  name: 'pronunciationFeedbackFlow',
  inputSchema: PronunciationFeedbackInputSchema,
  outputSchema: PronunciationFeedbackOutputSchema,
},
async input => {
  const {output} = await pronunciationFeedbackPrompt(input);
  return output!;
});
