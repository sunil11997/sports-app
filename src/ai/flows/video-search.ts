'use server';
/**
 * @fileOverview A Genkit flow for finding technical sports videos on YouTube.
 *
 * - videoSearch - A function that suggests high-quality YouTube videos for sports drills.
 * - VideoSearchInput - The input type for the search.
 * - VideoSearchOutput - The return type for the search.
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
  model: googleAI.model('gemini-2.0-flash'),
  input: {schema: VideoSearchInputSchema},
  output: {schema: VideoSearchOutputSchema},
  prompt: `You are Coach Sunil Deshmukh's AI Video Assistant. Your goal is to provide a high-quality instructional YouTube video URL for a specific technical sports drill.

IMPORTANT: You MUST provide the response in {{{language}}}.

Input Request:
- Sport: {{{sport}}}
- Drill: {{{drillName}}}

Please provide a highly relevant YouTube URL (e.g., https://www.youtube.com/watch?v=...) that demonstrates elite technique for this specific move. 
If you are unsure of a specific URL, provide a standard search URL like: https://www.youtube.com/results?search_query={{{sport}}}+{{{drillName}}}+instructional

Also, list 3-4 specific technical focus points the student should observe in the video to master this move.`,
});

const videoSearchFlow = ai.defineFlow(
  {
    name: 'videoSearchFlow',
    inputSchema: VideoSearchInputSchema,
    outputSchema: VideoSearchOutputSchema,
  },
  async (input) => {
    // Safety check for API Key
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
       throw new Error("AI Configuration Error: Please add your GEMINI_API_KEY.");
    }

    const {output} = await videoSearchPrompt(input);
    if (!output) throw new Error('AI could not find a video recommendation.');
    
    return output;
  }
);

export async function videoSearch(input: VideoSearchInput): Promise<VideoSearchOutput> {
  return videoSearchFlow(input);
}
