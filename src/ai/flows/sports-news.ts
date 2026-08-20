'use server';
/**
 * @fileOverview A Genkit flow for generating daily regional sports news briefings.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const NewsItemSchema = z.object({
  category: z.enum(['Maharashtra', 'India', 'World']),
  title: z.string().describe('Catchy headline for the sports news.'),
  date: z.string().describe('Status like LIVE, TODAY, or UPDATE.'),
  desc: z.string().describe('A brief 2-line summary.'),
  details: z.string().describe('Full detailed briefing for the institutional registry.'),
});

const NewsOutputSchema = z.object({
  items: z.array(NewsItemSchema),
});

export type NewsOutput = z.infer<typeof NewsOutputSchema>;

const newsPrompt = ai.definePrompt({
  name: 'newsPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {
    schema: z.object({
      date: z.string(),
      language: z.string(),
    }),
  },
  output: {schema: NewsOutputSchema},
  prompt: `You are the Institutional News AI for Waghamba Ashram Shala. 
  Today's Date: {{{date}}}
  
  Generate 3 highly relevant sports news briefings in {{{language}}}.
  Exactly one for each: Maharashtra, India, World.`,
});

function getSportsNewsFallback(language: string = 'English'): NewsOutput {
  const isMarathi = language === 'Marathi';
  if (isMarathi) {
    return {
      items: [
        {
          category: 'Maharashtra',
          title: 'महाराष्ट्र राज्य शालेय क्रीडा स्पर्धा २०२६: नाशिक विभागाची विजयी आगेकूच',
          date: 'LIVE',
          desc: 'नाशिक विभागीय शालेय कबड्डी व धावणे स्पर्धेत आश्रम शाळांच्या खेळाडूंची चमकदार कामगिरी.',
          details: 'नाशिक जिल्हा क्रीडा संकुलात सुरू असलेल्या राज्यस्तरीय निवड चाचणीत कबड्डी आणि १०० मी. स्प्रिंटमध्ये ग्रामीण व आश्रम शाळांच्या खेळाडूंनी आघाडी घेतली आहे.'
        },
        {
          category: 'India',
          title: 'खेलो इंडिया यूथ गेम्स: भारतीय युवा खेळाडूंचा नवा राष्ट्रीय विक्रम',
          date: 'TODAY',
          desc: 'ॲथलेटिक्स व कुस्ती प्रकारात महाराष्ट्राच्या खेळाडूंनी सुवर्ण पदकांची कमाई केली.',
          details: 'नॅशनल युथ चॅम्पियनशिपमध्ये ट्रॅक अँड फील्ड प्रकारात महाराष्ट्राच्या खेळाडूंनी उल्लेखनीय कामगिरी नोंदवली.'
        },
        {
          category: 'World',
          title: 'जागतिक ॲथलेटिक्स स्पर्धा: आशियाई खेळाडूंची ऑलिम्पिक पात्रता निश्चित',
          date: 'UPDATE',
          desc: 'आशियाई चॅम्पियनशिपमध्ये भालाफेक आणि रिले प्रकारात नवे उच्चांक प्रस्थापित.',
          details: 'आंतरराष्ट्रीय ऑलिम्पिक समितीच्या नियमानुसार युवा खेळाडूंसाठी विशेष प्रशिक्षण शिबिरे जाहीर.'
        }
      ]
    };
  }

  return {
    items: [
      {
        category: 'Maharashtra',
        title: 'Maharashtra State School Games 2026: Nashik Division Dominates',
        date: 'LIVE',
        desc: 'Ashram Shala athletes shine in regional Kabaddi and Sprint qualifiers.',
        details: 'Student-athletes from tribal and rural schools registered top podium finishes in 100m sprint and Kabaddi defense trials.'
      },
      {
        category: 'India',
        title: 'Khelo India Youth Games: National Athletic Records Broken',
        date: 'TODAY',
        desc: 'State contingent bags multiple golds in Track and Field events.',
        details: 'Record-setting performances in High Jump and Long Jump highlighted the junior national championship.'
      },
      {
        category: 'World',
        title: 'World Athletics Continental Tour: Olympic Benchmarks Cleared',
        date: 'UPDATE',
        desc: 'Asian athletes secure direct qualification in Javelin and Relay categories.',
        details: 'Top training academies announce advanced youth sports development pipelines.'
      }
    ]
  };
}

export async function getSportsNews(date: string, language: string = 'English'): Promise<NewsOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return getSportsNewsFallback(language);
  }

  let attempts = 0;
  const maxAttempts = 2;
  while (attempts < maxAttempts) {
    try {
      const {output} = await newsPrompt({date, language});
      if (output && output.items?.length) return output;
      break;
    } catch (error: any) {
      attempts++;
      if (attempts >= maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  return getSportsNewsFallback(language);
}

