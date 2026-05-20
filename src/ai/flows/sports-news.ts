'use server';
/**
 * @fileOverview A Genkit flow for generating daily regional sports news briefings.
 *
 * - getSportsNews - Generates sports news for specific regions and dates with retry logic.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const NewsItemSchema = z.object({
  category: z.enum(['Maharashtra', 'India', 'World']),
  title: z.string().describe('Catchy headline for the sports news.'),
  date: z.string().describe('Status like LIVE, TODAY, or UPDATE.'),
  desc: z.string().describe('A brief 2-line summary.'),
  details: z.string().describe('Full detailed briefing for the institutional registry.'),
});

const NewsOutputSchema = z.object({
  items: z.array(NewsItemSchema),
});

export type NewsOutput = z.infer<typeof NewsOutputSchema>;

const newsPrompt = ai.definePrompt({
  name: 'newsPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: {
    schema: z.object({
      date: z.string(),
      language: z.string(),
    }),
  },
  output: {schema: NewsOutputSchema},
  prompt: `You are the Institutional News AI for Waghamba Ashram Shala. 
  Today's Date: {{{date}}}
  
  Generate 3 highly relevant sports news briefings in {{{language}}}.
  You MUST generate exactly one item for each of these categories:
  1. Maharashtra: Focus on state trials, Nashik district events, or Kabaddi/Kho-Kho state news.
  2. India: Focus on National level athletics, Cricket, or Olympic preparation.
  3. World: Focus on major international championships or technical breakthroughs in sports science.

  The news should be realistic and reflect the current state of sports around the date provided. 
  Ensure the "details" section provides enough technical depth for a school sports coach.`,
});

/**
 * getSportsNews
 * Generates regional sports news with a high-resilience retry loop.
 */
export async function getSportsNews(date: string, language: string = 'English'): Promise<NewsOutput> {
  let attempts = 0;
  const maxAttempts = 3;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    try {
      const {output} = await newsPrompt({date, language});
      if (!output) throw new Error('AI returned an empty news pulse.');
      return output;
    } catch (error: any) {
      lastError = error;
      attempts++;
      
      const isQuotaOrUnavailable = 
        error.message?.includes('RESOURCE_EXHAUSTED') || 
        error.message?.includes('429') ||
        error.message?.includes('UNAVAILABLE') || 
        error.message?.includes('503');

      if (isQuotaOrUnavailable && attempts < maxAttempts) {
        console.warn(`WGB News Pulse: Demand spike detected (Attempt ${attempts}). Retrying with backoff...`);
        // Exponential backoff: 2s, 4s, etc.
        await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempts)));
        continue;
      }
      
      console.error("WGB News Pulse: AI generation failed:", error.message);
      throw error;
    }
  }
  throw lastError || new Error('Failed to generate news pulse after multiple attempts.');
}
