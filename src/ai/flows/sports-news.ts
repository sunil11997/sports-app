'use server';
/**
 * @fileOverview A Genkit flow for generating daily regional sports news briefings.
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
  model: googleAI.model('gemini-1.5-flash'),
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
  Exactly one for each: Maharashtra, India, World.`,
});

export async function getSportsNews(date: string, language: string = 'English'): Promise<NewsOutput> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("AI Configuration Missing.");
  }

  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      const {output} = await newsPrompt({date, language});
      return output!;
    } catch (error: any) {
      attempts++;
      if (attempts >= maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error('Failed to generate news.');
}
