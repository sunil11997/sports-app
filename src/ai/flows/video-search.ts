'use server';
/**
 * @fileOverview A Genkit flow for finding technical sports videos on YouTube.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const VideoSearchInputSchema = z.object({
  drillName: z.string().describe('The name of the technical drill or skill.'),
  sport: z.string().describe('The institutional game/sport.'),
  language: z.string().describe('The language for the response (English or Marathi).'),
});
export type VideoSearchInput = z.infer<typeof VideoSearchInputSchema>;

const VideoSearchOutputSchema = z.object({
  youtubeUrl: z.string().describe('The suggested YouTube URL for the technical drill.'),
  title: z.string().describe('A title for the video.'),
  focusPoints: z.string().describe('Key technical points to watch for in this video.'),
});
export type VideoSearchOutput = z.infer<typeof VideoSearchOutputSchema>;

const videoSearchPrompt = ai.definePrompt({
  name: 'videoSearchPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: VideoSearchInputSchema},
  output: {schema: VideoSearchOutputSchema},
  prompt: `You are Coach Sunil Deshmukh's AI Video Assistant. Provide a YouTube URL for:
- Sport: {{{sport}}}
- Drill: {{{drillName}}}
IMPORTANT: Respond in {{{language}}}.`,
});

export async function videoSearch(input: VideoSearchInput): Promise<VideoSearchOutput> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
     throw new Error("AI Configuration Error.");
  }

  const {output} = await videoSearchPrompt(input);
  return output!;
}
