'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic "Today in History" sports events.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const HistoryItemSchema = z.object({
  date: z.string().describe('The date of the event in "Month Day, Year" format.'),
  event: z.string().describe('A brief, inspiring description of the sports event.'),
});

const HistoryOutputSchema = z.object({
  items: z.array(HistoryItemSchema),
});

export type HistoryOutput = z.infer<typeof HistoryOutputSchema>;

const historyPrompt = ai.definePrompt({
  name: 'historyPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {
    schema: z.object({
      date: z.string(),
      language: z.string(),
    }),
  },
  output: {schema: HistoryOutputSchema},
  prompt: `You are the Institutional Historian for Waghamba Ashram Shala. 
  The current date is {{{date}}}.
  
  Generate 3 highly inspiring historical sports events that occurred on this same month and day.
  Focus on:
  1. Indian sporting legends.
  2. Traditional Indian sports.
  3. Global iconic moments.

  Provide the descriptions entirely in {{{language}}}.`,
});

function getSportsHistoryFallback(language: string = 'English'): HistoryOutput {
  const isMarathi = language === 'Marathi';
  if (isMarathi) {
    return {
      items: [
        {
          date: 'ऑगस्ट २०, १९८६',
          event: 'पी. टी. उषा (उडाणपरी) यांनी आशियाई क्रीडा स्पर्धेत ४ सुवर्ण पदके जिंकून भारतीय ॲथलेटिक्सचा सुवर्णकाळ रचला.'
        },
        {
          date: 'ऑगस्ट २९, १९३६',
          event: 'हॉकीचे जादूगार मेजर ध्यानचंद यांच्या नेतृत्वाखाली भारतीय संघाने ऑलिम्पिकमध्ये सलग तिसरे सुवर्णपदक पटकावले.'
        },
        {
          date: 'ऑगस्ट ०७, २०२१',
          event: 'नीरज चोप्रा यांनी टोकियो ऑलिम्पिकमध्ये ८७.५८ मीटर भालाफेक करून भारताला ॲथलेटिक्समधील ऐतिहासिक पहिले सुवर्णपदक मिळवून दिले.'
        }
      ]
    };
  }

  return {
    items: [
      {
        date: 'August 20, 1986',
        event: 'P.T. Usha set historic Asian athletic records by securing 4 Gold medals at the Asian Games.'
      },
      {
        date: 'August 29, 1936',
        event: 'Major Dhyan Chand led the Indian hockey contingent to an Olympic Gold, cementing India\'s global dominance.'
      },
      {
        date: 'August 07, 2021',
        event: 'Neeraj Chopra hurled 87.58m in Javelin Throw to claim India\'s historic first-ever Olympic Gold in track and field.'
      }
    ]
  };
}

export async function getSportsHistory(date: string, language: string = 'English'): Promise<HistoryOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return getSportsHistoryFallback(language);
  }

  let attempts = 0;
  const maxAttempts = 2;
  while (attempts < maxAttempts) {
    try {
      const {output} = await historyPrompt({date, language});
      if (output && output.items?.length) return output;
      break;
    } catch (error: any) {
      attempts++;
      if (attempts >= maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  return getSportsHistoryFallback(language);
}

