import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit instance configured for the Waghamba Sports Hub.
 * Optimized for high-resilience and free-tier recovery.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

export { z };
