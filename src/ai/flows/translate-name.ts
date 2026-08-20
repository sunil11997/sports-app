'use server';
/**
 * @fileOverview A Genkit flow for transliterating names from English to Marathi (Devanagari).
 * Upgraded to Gemini 1.5/2.5 Flash with resilient phonetic rule fallback for 100% reliability on Vercel.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { transliterateEnglishToMarathi } from '@/lib/utils';

const TranslateNameInputSchema = z.object({
  name: z.string().describe('The name in English to be translated to Marathi.'),
});
export type TranslateNameInput = z.infer<typeof TranslateNameInputSchema>;

/**
 * translateNameToMarathi - Uses Gemini AI when available, with instant phonetic transliteration fallback.
 * Even if user makes a spelling mistake in English, converts to proper Marathi.
 */
export async function translateNameToMarathi(input: TranslateNameInput): Promise<string> {
  const fallback = transliterateEnglishToMarathi(input.name || '');
  if (!input.name || input.name.trim().length === 0) {
    return "";
  }

  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return fallback;
  }

  try {
    const {text} = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      system: "You are an expert Marathi linguist and official school transliterator. Convert Indian English names to standard Marathi Devanagari script. Correct any obvious English spelling errors (e.g. 'Pujha' -> 'पूजा', 'Dhyaneshwar' -> 'ज्ञानेश्वर', 'Swaphnil' -> 'स्वप्निल'). Return ONLY the translated Devanagari name, nothing else.",
      prompt: `Translate and correct this name to Marathi: ${input.name}`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 60,
      }
    });
    
    const result = text ? text.trim().replace(/[\\/`*_{}[\]()<>#+-.!$]/g, '') : '';
    return result || fallback;
  } catch (error) {
    return fallback;
  }
}

