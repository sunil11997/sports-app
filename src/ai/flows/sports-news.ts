'use server';
/**
 * @fileOverview A Genkit flow for generating daily regional sports news briefings.
 *
 * - getSportsNews - Generates sports news for specific regions and dates.
 * - NewsInput - The input type for the news flow.
 * - NewsOutput - The return type for the news flow.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { Landmark, MapPin, Globe } from 'lucide-react';

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

export async function getSportsNews(date: string, language: string = 'English'): Promise<NewsOutput> {
  const {output} = await newsPrompt({date, language});
  if (!output) throw new Error('Failed to generate news pulse.');
  return output;
}
