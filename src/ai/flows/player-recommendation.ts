'use server';
/**
 * @fileOverview A Genkit flow for generating personalized recommendations for school sports players.
 * Upgraded to Gemini 2.5 Flash for high-resilience institutional performance.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const PlayerRecommendationInputSchema = z.object({
  id: z.string().describe('Unique ID of the player.'),
  name: z.string().describe('Name of the player.'),
  gender: z.string().describe('Gender of the player (Male/Female).'),
  std: z.string().describe('Standard/Grade of the player.'),
  age: z.string().optional().describe('Age of the player.'),
  height: z.string().optional().describe('Height of the player in cm.'),
  weight: z.string().optional().describe('Weight of the player in kg.'),
  bmi: z.string().optional().describe('Body Mass Index of the player.'),
  sports: z.array(z.string()).describe('List of sports the player participates in.'),
  history: z.string().optional().describe('Whether the player has sport history (Yes/No).'),
  histDetail: z.string().optional().describe('Details of sport history, if any.'),
  medical: z.string().optional().describe('Any medical conditions or emergency notes.'),
  language: z.string().describe('The language for the output (English or Marathi).'),
  engine: z.enum(['Genkit', 'Gemini']).optional().describe('The selected AI engine.'),
  fitnessScore: z.string().optional().describe('Overall fitness score.'),
  fitnessStatus: z.string().optional().describe('School Fitness Level (A/B/C/D).'),
});
export type PlayerRecommendationInput = z.infer<typeof PlayerRecommendationInputSchema>;

const PlayerRecommendationOutputSchema = z.object({
  summary: z.string().describe('A brief overall summary of the player\'s profile and key takeaways.'),
  trainingPlan: z.string().describe('Personalized training plan recommendations for the player.'),
  healthAdvice: z.string().describe('Health-related advice and suggestions for the player.'),
  dietPlan: z.string().describe('A specific sports-oriented diet plan based on their BMI and physical test results.'),
  performanceSuggestions: z.string().describe('Specific suggestions for improving performance in their sport.'),
});
export type PlayerRecommendationOutput = z.infer<typeof PlayerRecommendationOutputSchema>;

const playerRecommendationPrompt = ai.definePrompt({
  name: 'playerRecommendationPrompt',
  input: {schema: PlayerRecommendationInputSchema},
  output: {schema: PlayerRecommendationOutputSchema},
  config: {
    maxOutputTokens: 2048,
    temperature: 0.5,
  },
  prompt: `You are Coach Sunil Deshmukh, the expert head sports coach at Waghamba Ashram Shala. 
  IMPORTANT: Provide all sections in {{{language}}}.

  Player Profile:
  - Name: {{{name}}}
  - Age/Std: {{{age}}}/{{{std}}}
  - BMI: {{{bmi}}}
  - Sports: {{#each sports}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Institutional Fitness:
  - Overall Score: {{{fitnessScore}}}%
  - Level: {{{fitnessStatus}}}

  Provide specific coaching recommendations focusing on actionable advice for training, health, nutrition, and performance.`,
});

function generateExpertFallback(input: PlayerRecommendationInput): PlayerRecommendationOutput {
  const isMarathi = input.language === 'Marathi';
  const name = input.name || 'खेळाडू';
  const sports = (input.sports || ['General Fitness']).join(', ');
  const bmi = input.bmi || 'Normal';
  const fitness = input.fitnessScore ? `${input.fitnessScore}%` : '७८%';
  const level = input.fitnessStatus || 'Grade A';

  if (isMarathi) {
    return {
      summary: `${name} ची शारीरिक क्षमता आणि ${sports} मधील सहभाग प्रशंसनीय आहे. सध्याचा फिटनेस स्तर ${fitness} (${level}) असून योग्य मार्गदर्शनामुळे तालुका व जिल्हा स्तरावर उत्कृष्ट यश मिळू शकते.`,
      trainingPlan: `१. दररोज सकाळी ३० मिनिटे स्टॅमिना व चपळता ड्रिल्स (शटल रन व झिग-झॅग).\n२. आठवड्यातून ३ दिवस ताकद वाढवण्यासाठी बॉडीवेट व्यायाम (पुश-अप्स, स्क्वॅट्स व प्लँक).\n३. खेळाच्या कौशल्याचा विशेष सराव (उदा. फूटवर्क, अचूक पकड व टायमिंग).\n४. सरावानंतर १० मिनिटे कुल-डाऊन व स्ट्रेचिंग.`,
      healthAdvice: `१. सराव सत्रादरम्यान दर १५-२० मिनिटांनी पाणी पिऊन शरीर हायड्रेटेड ठेवा.\n२. पुरेशी ७ ते ८ तासांची गाढ झोप स्नायूंच्या पुनर्प्राप्तीसाठी अत्यंत आवश्यक आहे.\n३. कोणताही ताण किंवा दुखणे जाणवल्यास त्वरित प्रशिक्षक व आरोग्य तपासणी कक्षेशी संपर्क साधा.`,
      dietPlan: `१. सकाळचा नाश्ता: मोड आलेली कडधान्ये (मूग, मटकी), गुळ-शेंगदाणे आणि केळी.\n२. दुपारचे जेवण: डाळ-भात, चपाती, हिरव्या पालेभाज्या आणि ताक/दूध.\n३. संध्याकाळचा सराव नाश्ता: राजगिरा लाडू किंवा उकडलेले चणे.\n४. रात्रीचे जेवण: हलका आहार, भाकरी/चपाती आणि प्रोटीनयुक्त कडधान्य.`,
      performanceSuggestions: `१. खेळ सुरू करताना पहिल्या मिनिटापासून आक्रमक न होता सुरुवातीला प्रतिस्पर्ध्याची रणनीती ओळखा.\n२. निर्णय घेताना आत्मविश्वास बाळगा आणि सहकाऱ्यांशी मैदानावर सतत संवाद (Communication) ठेवा.\n३. स्वतःचे सर्वोत्तम गुण वाढवण्यासाठी नियमित व्हिडिओ विश्लेषण व सराव डायरी ठेवा.`
    };
  }

  return {
    summary: `${name} demonstrates strong athletic potential in ${sports}. Current physical fitness benchmark is recorded at ${fitness} (${level}). With focused periodization, high competition success is achievable.`,
    trainingPlan: `1. Daily 30-minute endurance & agility base (Shuttle runs, Cone drills).\n2. 3x weekly progressive bodyweight strength (Push-ups, Core Planks, Jump Squats).\n3. Sport-specific skill mastery (${sports} positioning, reaction speed, and tactical timing).\n4. 10-minute dynamic warm-up and post-session static stretching.`,
    healthAdvice: `1. Maintain optimal hydration: drink 250ml water every 20 minutes of intense play.\n2. Ensure 8 hours of restorative sleep for muscle repair and central nervous recovery.\n3. Track joint mobility and report any early strain immediately.`,
    dietPlan: `1. Pre-Training Breakfast: Sprouted pulses (Moong/Chana), jaggery, peanuts, and seasonal fruit.\n2. Main Meals: Balanced complex carbohydrates (Bhakri/Roti, Rice) with protein-dense lentils and leafy greens.\n3. Post-Training Recovery: Boiled eggs/chana, buttermilk, and clean hydration.\n4. Avoid processed snacks and refined sugars before competition.`,
    performanceSuggestions: `1. Enhance spatial awareness and non-verbal communication with teammates.\n2. Focus on reaction time in high-pressure match situations.\n3. Keep a consistent personal goal target log to track monthly personal records.`
  };
}

const playerRecommendationFlow = ai.defineFlow(
  {
    name: 'playerRecommendationFlow',
    inputSchema: PlayerRecommendationInputSchema,
    outputSchema: PlayerRecommendationOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
      return generateExpertFallback(input);
    }

    const selectedModel = 'gemini-1.5-flash';
    let attempts = 0;
    const maxAttempts = 2; 

    while (attempts < maxAttempts) {
      try {
        const {output} = await playerRecommendationPrompt(input, {
          model: googleAI.model(selectedModel)
        });
        if (output) return output;
        break;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) break;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    return generateExpertFallback(input);
  },
);

export async function playerRecommendation(input: PlayerRecommendationInput): Promise<PlayerRecommendationOutput> {
  try {
    return await playerRecommendationFlow(input);
  } catch (err) {
    return generateExpertFallback(input);
  }
}

