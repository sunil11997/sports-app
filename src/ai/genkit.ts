import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance configured for the Waghamba Sports Hub.
 * Strictly synchronized to Gemini 1.5 Flash for stable institutional performance.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: googleAI.model('gemini-1.5-flash'),
});

export { z };
