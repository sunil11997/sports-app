
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openai } from 'genkitx-openai';

/**
 * Genkit instance configured for the Waghamba Sports Hub.
 * Supports both Google AI (Gemini) and OpenAI plugins.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
    openai(),
  ],
  // Defaulting to Gemini 2.5 Flash for speed and cost-efficiency.
  // To use OpenAI by default, you can change this to e.g. openai.model('gpt-4o')
  model: googleAI.model('gemini-2.5-flash'),
});

export { z };
