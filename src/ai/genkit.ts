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
  // Use the standard identifier for the model
  model: 'googleai/gemini-2.5-flash',
});

export { z };
