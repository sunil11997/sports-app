import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance configured for the Waghamba Sports Hub.
 * Uses Gemini 2.5 Flash which is optimized for speed and cost-efficiency.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

export { z };
