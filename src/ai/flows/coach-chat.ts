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
  teacherContext: z.string().optional().describe('Context about the teacher/coach from their profile.'),
  language: z.string().describe('The language for the response (English or Marathi).'),
  engine: z.enum(['Genkit', 'Gemini Pro']).optional().describe('The selected AI engine.'),
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

    let selectedModel = 'gemini-2.5-flash';
    if (input.engine === 'Gemini Pro') {
      selectedModel = 'gemini-3.1-pro-preview';
    }

    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        const {text} = await ai.generate({
          model: googleAI.model(selectedModel),
          system: `You are Coach Sunil Deshmukh, the head physical education teacher and sports coach at Waghamba Ashram Shala. 
          You are helpful, encouraging, and provide scientifically-backed sports training and health advice.
          You speak with the authority and warmth of a respected school coach.
          
          INSTITUTIONAL CONTEXT:
          ${input.teacherContext || 'Acting Head Coach at Waghamba'}
          
          AI ENGINE CONTEXT: You are responding via the ${input.engine || 'Genkit Standard'} engine. 
          If using Gemini Pro, provide significantly deeper tactical and pedagogical analysis.
          
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
        
        const isQuota = error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('429');
        const isUnavailable = error.message?.includes('UNAVAILABLE') || error.message?.includes('503');

        if (isQuota || isUnavailable) {
          console.warn("WGB AI Chat: Demand spike or quota hit, falling back to Flash model...");
          selectedModel = 'gemini-2.5-flash';
        }

        console.error(`Coach Chat Attempt ${attempts} failed:`, error.message || error);
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(1.5, attempts)));
      }
    }
    return "The AI coach is currently busy due to high demand. Please try asking again in a few moments.";
  }
);

export async function coachChat(input: CoachChatInput): Promise<string> {
  return coachChatFlow(input);
}
