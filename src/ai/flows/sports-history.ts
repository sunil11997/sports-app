'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic "Today in History" sports events.
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
  model: googleAI.model('gemini-1.5-flash'),
  input: {
    schema: z.object({
      date: z.string(),
      language: z.string(),
    }),
  },
  output: {schema: HistoryOutputSchema},
  prompt: `You are the Institutional Historian for Waghamba Ashram Shala. 
  The current date is {{{date}}}.
  
  Generate 3 highly inspiring historical sports events that occurred on this same month and day.
  Focus on:
  1. Indian sporting legends.
  2. Traditional Indian sports.
  3. Global iconic moments.

  Provide the descriptions entirely in {{{language}}}.`,
});

export async function getSportsHistory(date: string, language: string = 'English'): Promise<HistoryOutput> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("AI Configuration Missing.");
  }

  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      const {output} = await historyPrompt({date, language});
      return output!;
    } catch (error: any) {
      attempts++;
      if (attempts >= maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error('Failed to generate history.');
}
