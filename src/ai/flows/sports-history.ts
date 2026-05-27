'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic "Today in History" sports events.
 *
 * - getSportsHistory - Generates historical sports events for specific dates.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const HistoryItemSchema = z.object({
  date: z.string().describe('The date of the event in "Month Day, Year" format.'),
  event: z.string().describe('A brief, inspiring description of the sports event.'),
});

const HistoryOutputSchema = z.object({
  items: z.array(HistoryItemSchema),
});

export type HistoryOutput = z.infer<typeof HistoryOutputSchema>;

const historyPrompt = ai.definePrompt({
  name: 'historyPrompt',
  model: googleAI.model('gemini-2.0-flash'),
  input: {
    schema: z.object({
      date: z.string(),
      language: z.string(),
    }),
  },
  output: {schema: HistoryOutputSchema},
  prompt: `You are the Institutional Historian for Waghamba Ashram Shala. 
  The current date is {{{date}}}.
  
  Generate 3 highly inspiring historical sports events that occurred on this same month and day (the anniversary) throughout history.
  Focus on:
  1. Indian sporting legends (Cricket, Athletics, Hockey, etc.).
  2. Traditional Indian sports (Kabaddi, Kho-Kho achievements).
  3. Global iconic moments (Olympics, FIFA, etc.).

  The tone should be educational and encouraging for school-age students. 
  Provide the descriptions entirely in {{{language}}}.`,
});

/**
 * getSportsHistory
 * Generates historical sports events with an optimized cooldown for Server Action stability.
 */
export async function getSportsHistory(date: string, language: string = 'English'): Promise<HistoryOutput> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("AI Configuration Missing: GEMINI_API_KEY not found.");
  }

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    try {
      const {output} = await historyPrompt({date, language});
      if (!output) throw new Error('AI returned an empty history vault.');
      return output;
    } catch (error: any) {
      lastError = error;
      attempts++;
      
      const isQuota = error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('429');
      const isUnavailable = error.message?.includes('UNAVAILABLE') || error.message?.includes('503');

      if (isQuota && attempts < maxAttempts) {
        console.warn(`WGB History Vault: Quota hit. Waiting 15s (Attempt ${attempts})...`);
        await new Promise(resolve => setTimeout(resolve, 15000));
        continue;
      }

      if (isUnavailable && attempts < maxAttempts) {
        const delay = 3000 * Math.pow(1.5, attempts);
        console.warn(`WGB History Vault: AI demand spike. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error("WGB History Vault: AI generation failed:", error.message);
      throw error;
    }
  }
  throw lastError || new Error('Failed to generate history pulse after multiple attempts.');
}
