'use server';
/**
 * @fileOverview A Genkit flow for a conversational AI sports coach.
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
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      return input.language === 'Marathi' 
        ? "AI कॉन्फिगरेशन त्रुटी: कृपया तुमची API Key जोडा." 
        : "AI Configuration Error: Please add your GEMINI_API_KEY to the .env file.";
    }

    // Reverted to gemini-1.5-flash for stable baseline
    const selectedModel = 'gemini-1.5-flash';
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const {text} = await ai.generate({
          model: googleAI.model(selectedModel),
          config: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
          system: `You are Coach Sunil Deshmukh, the head physical education teacher and sports coach at Waghamba Ashram Shala. 
          INSTITUTIONAL CONTEXT: ${input.teacherContext || 'Acting Head Coach at Waghamba'}
          IMPORTANT: Respond entirely in ${input.language}.
          CONTEXT ON CURRENT STUDENT: ${input.playerContext || 'General coaching inquiry'}`,
          messages: input.history.map(m => ({
            role: m.role,
            content: [{text: m.content}]
          })),
          prompt: input.message,
        });
        
        return text;
      } catch (error: any) {
        attempts++;
        console.warn(`WGB AI Chat Attempt ${attempts} failed:`, error.message || error);
        
        if (attempts >= maxAttempts) {
          return input.language === 'Marathi'
            ? "AI सध्या व्यस्त आहे. कृपया थोड्या वेळाने प्रयत्न करा."
            : "The AI coach is currently processing high demand. Please try again in a few moments.";
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return "AI system synchronization error. Please refresh.";
  }
);

export async function coachChat(input: CoachChatInput): Promise<string> {
  return coachChatFlow(input);
}
