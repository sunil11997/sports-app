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

function getVideoSearchFallback(input: VideoSearchInput): VideoSearchOutput {
  const isMarathi = input.language === 'Marathi';
  const sport = input.sport || 'Sports';
  const drill = input.drillName || 'Training Drill';

  if (isMarathi) {
    return {
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(sport + ' ' + drill + ' training drill')}`,
      title: `${sport} - ${drill} (अधिकृत तंत्र व सराव व्हिडिओ)`,
      focusPoints: `१. खेळाडूची सुरुवातीची शारीरिक स्थिती (Body Posture).\n२. पाय आणि हातांची अचूक हालचाल व तोल.\n३. सराव सत्रात किमान १०-१५ पुनरावृत्ती (Reps) करणे.\n४. दुखापत टाळण्यासाठी योग्य फॉर्म पाळणे.`
    };
  }

  return {
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(sport + ' ' + drill + ' training drill')}`,
    title: `${sport} - ${drill} (Official Technique & Drill Video)`,
    focusPoints: `1. Observe starting foot stance and center of gravity.\n2. Note the explosive follow-through and arm coordination.\n3. Execute 10-15 controlled repetitions in practice.\n4. Prioritize proper anatomical form over speed initially.`
  };
}

export async function videoSearch(input: VideoSearchInput): Promise<VideoSearchOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return getVideoSearchFallback(input);
  }

  try {
    const {output} = await videoSearchPrompt(input);
    return output || getVideoSearchFallback(input);
  } catch (err) {
    return getVideoSearchFallback(input);
  }
}

