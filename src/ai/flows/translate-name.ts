'use server';
/**
 * @fileOverview A Genkit flow for transliterating names from English to Marathi (Devanagari).
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const TranslateNameInputSchema = z.object({
  name: z.string().describe('The name in English to be translated to Marathi.'),
});
export type TranslateNameInput = z.infer<typeof TranslateNameInputSchema>;

/**
 * translateNameToMarathi - Uses Gemini to perform high-accuracy phonetic transliteration.
 */
export async function translateNameToMarathi(input: TranslateNameInput): Promise<string> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("AI Configuration Error: Missing API Key.");
  }

  try {
    const {text} = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      system: "You are a professional transliterator specializing in Indian names. Convert English names to Marathi (Devanagari script) with high phonetic accuracy. Return ONLY the translated name in Devanagari script, nothing else. Do not provide explanations or alternatives.",
      prompt: `Translate this name to Marathi: ${input.name}`,
      config: {
        temperature: 0.1, // Low temperature for deterministic transliteration
      }
    });
    
    return text.trim();
  } catch (error) {
    console.error("WGB Name Translation Error:", error);
    throw new Error("Failed to auto-translate name.");
  }
}
