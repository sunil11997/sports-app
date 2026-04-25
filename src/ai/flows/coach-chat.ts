'use server';
/**
 * @fileOverview A Genkit flow for a conversational AI sports coach.
 *
 * - coachChat - A function that handles a chat conversation with the AI coach.
 * - CoachChatInput - The input type for the chat.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
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
    // Safety check for API Key
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      return input.language === 'Marathi' 
        ? "AI कॉन्फिगरेशन त्रुटी: कृपया तुमची API Key जोडा." 
        : "AI Configuration Error: Please add your GEMINI_API_KEY to the .env file.";
    }

    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const {text} = await ai.generate({
          model: googleAI.model('gemini-2.5-flash'),
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
        console.error(`Coach Chat Attempt ${attempts} failed:`, error.message || error);
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      }
    }
    return "The AI coach is currently busy with other students. Please try asking again in a few moments.";
  }
);

export async function coachChat(input: CoachChatInput): Promise<string> {
  return coachChatFlow(input);
}
