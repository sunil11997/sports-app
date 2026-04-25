import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance configured for the Waghamba Sports Hub.
 * Uses Google AI (Gemini) as the primary provider.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Gemini 2.5 Flash is highly optimized for performance and lower latencies
  model: googleAI.model('gemini-2.5-flash'),
});

export { z };
