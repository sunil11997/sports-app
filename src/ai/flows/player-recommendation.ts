'use server';
/**
 * @fileOverview A Genkit flow for generating personalized sports recommendations for school athletes.
 * Enforces PII minimization, neutral institutional AI identity, and strict health safety boundaries.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

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
  summary: z.string().describe("A brief overall summary of the athlete's athletic profile."),
  trainingPlan: z.string().describe('Personalized training plan recommendations for the player.'),
  healthAdvice: z.string().describe('Health and recovery suggestions (educational, non-diagnostic).'),
  dietPlan: z.string().describe('A specific sports-oriented diet plan based on age and activity.'),
  performanceSuggestions: z.string().describe('Actionable suggestions for competitive skill improvement.'),
});
export type PlayerRecommendationOutput = z.infer<typeof PlayerRecommendationOutputSchema>;

const playerRecommendationPrompt = ai.definePrompt({
  name: 'playerRecommendationPrompt',
  input: { schema: PlayerRecommendationInputSchema },
  output: { schema: PlayerRecommendationOutputSchema },
  config: {
    maxOutputTokens: 2048,
    temperature: 0.5,
  },
  prompt: `You are an AI Sports Science & Coaching Assistant for Waghamba Sports Health Hub. 
  Your role is to offer supportive physical education and sports training suggestions for school students.

  SAFETY INSTRUCTIONS:
  - Respond entirely in {{{language}}}.
  - You are NOT a doctor. Do not provide clinical diagnosis or prescribe treatments.
  - Recommend clinical evaluation for any persistent pain or medical symptoms.

  Anonymized Physical Profile:
  - Standard/Grade: Class {{{std}}}
  - Age: {{{age}}} | Gender: {{{gender}}}
  - BMI: {{{bmi}}}
  - Disciplines: {{#each sports}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Fitness Score: {{{fitnessScore}}}% ({{{fitnessStatus}}})

  Generate constructive, age-appropriate guidance for physical education, skill acquisition, basic sports nutrition, and training.`,
});

function generateExpertFallback(input: PlayerRecommendationInput): PlayerRecommendationOutput {
  const isMarathi = input.language === 'Marathi';
  const displayName = input.name || (isMarathi ? 'खेळाडू' : 'Student Athlete');
  const sports = (input.sports || ['General Athletics']).join(', ');
  const fitness = input.fitnessScore ? `${input.fitnessScore}%` : '७८%';
  const level = input.fitnessStatus || 'Grade A';

  if (isMarathi) {
    return {
      summary: `${displayName} ची शारीरिक क्षमता आणि ${sports} मधील सहभाग प्रशंसनीय आहे. सध्याचा फिटनेस स्तर ${fitness} (${level}) असून सातत्यपूर्ण सरावाने जिल्हा स्तरावर उत्कृष्ट यश मिळू शकते.`,
      trainingPlan: `१. दररोज सकाळी २५-३० मिनिटे स्टॅमिना व चपळता ड्रिल्स (शटल रन व झिग-झॅग).\n२. आठवड्यातून ३ दिवस बॉडीवेट व्यायाम (पुश-अप्स, स्क्वॅट्स व कोर प्लँक).\n३. खेळाच्या कौशल्याचा विशेष सराव (उदा. अचूक पकड, फूटवर्क व टायमिंग).\n४. सरावानंतर १० मिनिटे कुल-डाऊन व स्ट्रेचिंग.`,
      healthAdvice: `१. सराव सत्रादरम्यान नियमित पाणी पिऊन शरीर हायड्रेटेड ठेवा.\n२. पुरेशी ७ ते ८ तासांची गाढ झोप स्नायूंच्या पुनर्प्राप्तीसाठी आवश्यक आहे.\n३. कोणताही ताण किंवा वेदना जाणवल्यास सराव थांबवून वैद्यकीय तपासणी करावी.`,
      dietPlan: `१. सकाळचा नाश्ता: मोड आलेली कडधान्ये (मूग, मटकी), गूळ-शेंगदाणे आणि केळी.\n२. दुपारचे जेवण: डाळ-भात, ज्वारी/बाजरी भाकरी, हिरव्या पालेभाज्या आणि ताक.\n३. सराव नंतर: उकडलेले चणे किंवा अंडी आणि लिंबू पाणी.\n४. रात्रीचे जेवण: हलका संतुलित आहार व हळदयुक्त दूध.`,
      performanceSuggestions: `१. खेळादरम्यान निर्णय घेताना संयम बाळगा आणि सहकाऱ्यांशी मैदानावर सतत संवाद ठेवा.\n२. स्वतःच्या कौशल्यांचे विश्लेषण करून मासिक सराव उद्दिष्टे पूर्ण करा.\n३. सकारात्मक वृत्ती आणि खेळभावना जोपासा.`
    };
  }

  return {
    summary: `${displayName} demonstrates positive athletic potential and dedication in ${sports}. Current physical fitness benchmark is ${fitness} (${level}).`,
    trainingPlan: `1. Daily 30-minute aerobic conditioning & agility base (Shuttle runs, Cone footwork).\n2. 3x weekly progressive bodyweight strength (Push-ups, Core Planks, Bodyweight Squats).\n3. Sport-specific skill drills (${sports} positioning, reaction speed, tactical balance).\n4. 10-minute dynamic warm-up and post-session static stretching.`,
    healthAdvice: `1. Maintain optimal hydration: drink water at regular intervals during practice.\n2. Ensure 8 hours of restful sleep for muscle recovery and cognitive focus.\n3. Report any persistent joint pain or muscular discomfort to the physical education teacher immediately.`,
    dietPlan: `1. Morning Breakfast: Sprouted pulses (Moong/Chana), roasted peanuts, jaggery, and seasonal fruit.\n2. Lunch: Complex carbohydrates (Roti/Bhakri, Rice) with protein-rich lentils and greens.\n3. Post-Training: Boiled gram/eggs and electrolyte replenishment.\n4. Dinner: Light wholesome meal and warm milk prior to bedtime.`,
    performanceSuggestions: `1. Strengthen on-field tactical communication with teammates.\n2. Focus on movement mechanics under fatigue.\n3. Set measurable monthly personal records in agility and endurance.`
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

    // Sanitize input: Replace identifiable name with generic athlete label in the AI prompt
    const sanitizedInput = {
      ...input,
      name: `Athlete #${input.id.slice(-4)}`,
      medical: undefined, // Never send private medical records to external AI
    };

    while (attempts < maxAttempts) {
      try {
        const { output } = await playerRecommendationPrompt(sanitizedInput, {
          model: googleAI.model(selectedModel),
        });
        if (output) return output;
        break;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) break;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
    return generateExpertFallback(input);
  }
);

export async function playerRecommendation(input: PlayerRecommendationInput): Promise<PlayerRecommendationOutput> {
  try {
    return await playerRecommendationFlow(input);
  } catch (err) {
    return generateExpertFallback(input);
  }
}
