import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

/**
 * Genkit instance configured for the Waghamba Sports Hub.
 * Uses Gemini 1.5 Flash for high-speed, stable performance.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKey && apiKey !== 'YOUR_KEY_HERE' ? apiKey : undefined }),
  ],
  model: googleAI.model('gemini-1.5-flash'),
});

export { z };

