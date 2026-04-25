'use server';
/**
 * @fileOverview A Genkit flow for a conversational AI sports coach.
 *
 * - coachChat - A function that handles a chat conversation with the AI coach.
 * - CoachChatInput - The input type for the chat.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const CoachChatInputSchema = z.object({
  message: z.string().describe('The user\'s current message.'),
  history: z.array(MessageSchema).describe('The conversation history.'),
  playerContext: z.string().optional().describe('Context about the student being discussed.'),
  language: z.string().describe('The language for the response (English or Marathi).'),
});
export type CoachChatInput = z.infer<typeof CoachChatInputSchema>;

const coachChatFlow = ai.defineFlow(
  {
    name: 'coachChatFlow',
    inputSchema: CoachChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        const {text} = await ai.generate({
          system: `You are an expert school sports coach and health advisor at Waghamba Ashram Shala. 
          You are helpful, encouraging, and provide scientifically-backed sports training and health advice.
          
          IMPORTANT: You MUST respond entirely in ${input.language}.
          
          CONTEXT ON CURRENT STUDENT:
          ${input.playerContext || 'General coaching inquiry'}`,
          messages: input.history.map(m => ({
            role: m.role,
            content: [{text: m.content}]
          })),
          prompt: input.message,
        });
        
        return text;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return "The AI coach is currently busy with other students. Please try asking again in a few moments.";
  }
);

export async function coachChat(input: CoachChatInput): Promise<string> {
  return coachChatFlow(input);
}
