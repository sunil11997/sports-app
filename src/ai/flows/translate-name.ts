'use server';
/**
 * @fileOverview A Genkit flow for transliterating names from English to Marathi (Devanagari).
 * Upgraded to Gemini 2.5 Flash for high-resilience institutional performance.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const TranslateNameInputSchema = z.object({
  name: z.string().describe('The name in English to be translated to Marathi.'),
});
export type TranslateNameInput = z.infer<typeof TranslateNameInputSchema>;

/**
 * translateNameToMarathi - Uses Gemini 2.5 to perform high-accuracy phonetic transliteration.
 * Optimized for institutional registers.
 */
export async function translateNameToMarathi(input: TranslateNameInput): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey || !input.name || input.name.length < 2) {
    return "";
  }

  try {
    const {text} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      system: "You are a professional transliterator specializing in Indian names. Convert English names to Marathi (Devanagari script) with high phonetic accuracy. Return ONLY the translated name in Devanagari script, nothing else. Do not provide explanations, variants, or punctuation.",
      prompt: `Translate this name to Marathi: ${input.name}`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 50,
      }
    });
    
    return text.trim();
  } catch (error) {
    console.warn("WGB Name Translation Sync Warning (Network/Quota):", error);
    return ""; // Graceful fallback: return empty to avoid Server 500 error in action
  }
}
