'use server';
/**
 * @fileOverview A Genkit flow for expert fitness test analysis and instructions.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const FitnessAnalysisInputSchema = z.object({
  age: z.number().describe('Student age.'),
  gender: z.string().describe('Student gender.'),
  testName: z.string().describe('Name of the fitness test.'),
  score: z.string().describe('The score achieved.'),
  language: z.string().describe('Display language (English or Marathi).'),
});
export type FitnessAnalysisInput = z.infer<typeof FitnessAnalysisInputSchema>;

const FitnessAnalysisOutputSchema = z.object({
  status: z.enum(['Below Average', 'Average', 'Excellent']),
  feedback: z.string().describe('Encouraging, data-driven feedback.'),
  recommendations: z.string().describe('Specific drills or maintenance tips.'),
  sportsBenefit: z.string().describe('How this strength helps in specific sports.'),
});
export type FitnessAnalysisOutput = z.infer<typeof FitnessAnalysisOutputSchema>;

function generateFitnessFallback(input: FitnessAnalysisInput): FitnessAnalysisOutput {
  const isMarathi = input.language === 'Marathi';
  const numScore = parseFloat(input.score) || 15;
  const isHigh = numScore >= 20 || input.score.toLowerCase().includes('good') || input.score.toLowerCase().includes('pass');
  
  if (isMarathi) {
    return {
      status: isHigh ? 'Excellent' : 'Average',
      feedback: `${input.testName} मध्ये नोंदवलेला स्कोर (${input.score}) विद्यार्थ्याच्या वयोगटानुसार चांगला आहे. सातत्यपूर्ण सरावाने क्षमता अजून वाढवता येईल.`,
      recommendations: `१. दररोज १५ मिनिटे विशिष्ट ताकद व लवचिकता व्यायाम करा.\n२. वॉर्म-अप आणि कुल-डाऊन न चुकता करा.\n३. नियमित पुनर्तपासणी करून प्रगतीची नोंद ठेवा.`,
      sportsBenefit: `ही शारीरिक क्षमता कबड्डी, धावणे आणि व्हॉलीबॉलमधील चपळता आणि दम वाढवण्यासाठी थेट मदत करते.`
    };
  }

  return {
    status: isHigh ? 'Excellent' : 'Average',
    feedback: `The recorded result (${input.score}) for ${input.testName} aligns with age-appropriate physical development norms. Consistent structured training will unlock higher performance.`,
    recommendations: `1. Incorporate 15 minutes of sport-specific strength and conditioning daily.\n2. Ensure thorough dynamic warm-up and post-exercise recovery.\n3. Re-evaluate every 30 days to track progression.`,
    sportsBenefit: `Developing this motor competency directly enhances explosive agility, stamina, and injury resistance across athletics, kabaddi, and field sports.`
  };
}

export async function analyzeFitness(input: FitnessAnalysisInput): Promise<FitnessAnalysisOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return generateFitnessFallback(input);
  }

  try {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      system: `You are an expert AI Sports Scientist and Fitness Coach. Your goal is to analyze fitness test results for school-age students (ages 6-18). 
      IMPORTANT: Respond entirely in ${input.language}.`,
      prompt: `Analyze this result: Age: ${input.age}, Gender: ${input.gender}, Test: ${input.testName}, Score: ${input.score}`,
      output: {schema: FitnessAnalysisOutputSchema},
    });
    return output || generateFitnessFallback(input);
  } catch (err) {
    return generateFitnessFallback(input);
  }
}

const InstructionInputSchema = z.object({
  testName: z.enum(['Beep Test', 'Sit and Reach', 'Partial Curl-Up']),
  language: z.string(),
});

export async function getTestInstructions(input: z.infer<typeof InstructionInputSchema>): Promise<string> {
  const isMarathi = input.language === 'Marathi';
  const defaultInstructions: Record<string, string> = {
    'Beep Test': isMarathi 
      ? "२० मीटरच्या दोन रेषांमध्ये बीप आवाजाच्या तालावर धावणे. प्रत्येक लेव्हलला वेळ कमी होतो. खेळाडूचा एरोबिक स्टॅमिना मोजण्यासाठी ही चाचणी वापरतात."
      : "A progressive multi-stage shuttle run between two lines 20m apart, synchronized with audio beeps to measure aerobic endurance (VO2 Max).",
    'Sit and Reach': isMarathi
      ? "पाय सरळ ठेवून बॉक्सवर पुढे वाकून हातांनी कमाल अंतर गाठणे. पाठीचा कणा आणि हॅमस्ट्रिंगची लवचिकता मोजण्यासाठी ही चाचणी घेतली जाते."
      : "Measures lower back and hamstring flexibility by reaching forward along a measuring scale while sitting with legs straight.",
    'Partial Curl-Up': isMarathi
      ? "गुडघे वाकवून पाठीवर झोपून १ मिनिटात पोटाच्या स्नायूंचा जोर लावून उठणे. कोर आणि पोटाच्या स्नायूंची ताकद मोजणे हे याचे उद्दिष्ट आहे."
      : "Assesses abdominal muscular strength and endurance by performing controlled crunches with knees bent."
  };

  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return defaultInstructions[input.testName] || defaultInstructions['Beep Test'];
  }

  try {
    const {text} = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      system: `You are an expert AI Sports Scientist. Provide clear instructions for fitness tests.`,
      prompt: `Explain the ${input.testName} in ${input.language}.`,
    });
    return text || defaultInstructions[input.testName];
  } catch (err) {
    return defaultInstructions[input.testName] || defaultInstructions['Beep Test'];
  }
}

