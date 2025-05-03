
'use server';
/**
 * @fileOverview A simple support chatbot flow using Genkit.
 *
 * - handleSupportChat - A function that handles the chatbot interaction.
 * - SupportChatInput - The input type for the handleSupportChat function.
 * - SupportChatOutput - The return type for the handleSupportChat function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the structure for a single message in the chat history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Input schema: accepts a history of messages
const SupportChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The chat history between the user and the model.'),
  // Potentially add other context like user ID, current page, etc. later
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

// Output schema: returns the model's response
const SupportChatOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the user."),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

// Define the prompt for the chatbot
const supportChatPrompt = ai.definePrompt({
    name: 'supportChatPrompt',
    input: {
        schema: SupportChatInputSchema,
    },
    output: {
        schema: SupportChatOutputSchema,
    },
    prompt: `You are a friendly and helpful support assistant for LinguaLeap, an English learning platform. Your goal is to assist users with their questions about the platform.

Keep your responses concise and helpful. If you don't know the answer, politely say so and suggest contacting human support (though we don't have a specific contact method defined yet, just mention the possibility).

Here is the conversation history so far:
{{#each history}}
{{role}}: {{{content}}}
{{/each}}
model:`, // The 'model:' at the end prompts the AI to generate the next response.
});


// Define the Genkit flow
const supportChatFlow = ai.defineFlow<
  typeof SupportChatInputSchema,
  typeof SupportChatOutputSchema
>(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    // Basic flow: just call the prompt
    // In a more complex scenario, you might add tool calls here (e.g., to look up user data or platform info)
    const llmResponse = await supportChatPrompt(input);
    const output = llmResponse.output;

    if (!output?.response) {
       console.error("LLM failed to generate a valid response:", llmResponse);
       // Provide a fallback response in case of LLM failure
       return { response: "Sorry, I encountered an issue and couldn't process your request. Please try again." };
    }

    return output;
  }
);

// Exported async wrapper function to be called by the UI
export async function handleSupportChat(input: SupportChatInput): Promise<SupportChatOutput> {
    // Basic validation: ensure history is not empty or only contains model messages initially (might need adjustment)
    if (!input.history || input.history.length === 0) {
        // Potentially return a default greeting or ask for input
        return { response: "Hello! How can I help you with LinguaLeap today?" };
    }
    // Call the Genkit flow
    return supportChatFlow(input);
}

