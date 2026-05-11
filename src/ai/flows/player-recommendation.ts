'use server';
/**
 * @fileOverview A Genkit flow for generating personalized recommendations for school sports players.
 *
 * - playerRecommendation - A function that generates AI-powered recommendations for a player.
 * - PlayerRecommendationInput - The input type for the playerRecommendation function.
 * - PlayerRecommendationOutput - The return type for the playerRecommendation function.
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
  // Enhanced Fitness Test Results
  fitnessShuttleRun: z.string().optional().describe('10x6 Shuttle Run result in seconds.'),
  fitnessRun50m: z.string().optional().describe('50 Meter Run result in seconds.'),
  fitnessRun600m: z.string().optional().describe('600 Meter Run result.'),
  fitnessSitAndReach: z.string().optional().describe('Flexibility / Sit and Reach in CM.'),
  fitnessBoardJump: z.string().optional().describe('Power / Board Jump in CM.'),
  fitnessSitUps: z.string().optional().describe('Core Strength / Sit Ups count.'),
  fitnessScore: z.string().optional().describe('Overall fitness score.'),
  fitnessStatus: z.string().optional().describe('School Fitness Level (A/B/C/D).'),
  // Skill Data
  sportSkill1: z.string().optional().describe('First specific skill for their primary/selected sport.'),
  sportSkill2: z.string().optional().describe('Second specific skill for their primary/selected sport.'),
  sportSkillScore: z.string().optional().describe('Overall skill score for their primary/selected sport.'),
  detailedKabaddiSkills: z.record(z.string()).optional().describe('For Kabaddi, a list of all technical moves and their scores out of 10.'),
  detailedVolleyballSkills: z.record(z.string()).optional().describe('For Volleyball, a list of technical moves and scores out of 10.'),
  detailedHandballSkills: z.record(z.string()).optional().describe('For Handball, a list of technical moves and scores out of 10.'),
  detailedKhoKhoSkills: z.record(z.string()).optional().describe('For Kho Kho, a list of technical moves and scores out of 10.'),
  detailedRunningSkills: z.record(z.string()).optional().describe('For Running, a list of technical moves and scores out of 10.'),
  detailedShotPutSkills: z.record(z.string()).optional().describe('For Shot Put, a list of technical moves and scores out of 10.'),
  detailedJavlineSkills: z.record(z.string()).optional().describe('For Javelin Throw, a list of technical moves and scores out of 10.'),
  detailedLongJumpSkills: z.record(z.string()).optional().describe('For Long Jump, a list of technical moves and scores out of 10.'),
  detailedHighJumpSkills: z.record(z.string()).optional().describe('For High Jump, a list of technical moves and scores out of 10.'),
  pastHealthIncidents: z.string().optional().describe('Summarized list of past health incidents for the player.'),
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
  model: googleAI.model('gemini-2.5-flash'), // Default, can be overridden in generate call
  input: {schema: PlayerRecommendationInputSchema},
  output: {schema: PlayerRecommendationOutputSchema},
  prompt: `You are Coach Sunil Deshmukh, the expert head sports coach at Waghamba Ashram Shala. Your task is to analyze a player's aggregated data and provide your professional recommendations for their athletic development and well-being.

AI ENGINE CONTEXT: You are performing this analysis via the {{engine}} engine.

IMPORTANT: You MUST provide all sections of your response in {{{language}}}.

Player Profile:
- Name: {{{name}}}
- Gender: {{{gender}}}
- Standard: {{{std}}}
- Age: {{{age}}}
- Height: {{{height}}} cm
- Weight: {{{weight}}} kg
- BMI: {{{bmi}}}
- Participating Sports: {{#each sports}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Medical History: {{{medical}}}

Institutional Fitness Assessment:
- 10x6 Shuttle Run: {{{fitnessShuttleRun}}}
- 50 Meter Run: {{{fitnessRun50m}}}
- 600 Meter Run: {{{fitnessRun600m}}}
- Sit and Reach: {{{fitnessSitAndReach}}}
- Board Jump: {{{fitnessBoardJump}}}
- Sit Ups: {{{fitnessSitUps}}}
- Overall Score: {{{fitnessScore}}}
- School Fitness Level: {{{fitnessStatus}}}

Health Context: {{{pastHealthIncidents}}}

Based on this granular data, provide highly specific coaching recommendations. 
Analyze which specific tests (e.g., endurance vs agility) or technical moves (for the selected sports) need more work. 

IMPORTANT: Provide a detailed DIET PLAN section that addresses their BMI category and energy requirements for their specific sports. If they are underweight, focus on healthy mass building. If they have low endurance (based on 600m run), focus on stamina-boosting foods.

Focus on actionable advice for training, health, nutrition, and performance improvement. Use a professional, encouraging tone as Coach Sunil Deshmukh.
`,
});

const playerRecommendationFlow = ai.defineFlow(
  {
    name: 'playerRecommendationFlow',
    inputSchema: PlayerRecommendationInputSchema,
    outputSchema: PlayerRecommendationOutputSchema,
  },
  async (input) => {
    // Safety check for API Key
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error(input.language === 'Marathi' 
        ? "AI कॉन्फिगरेशन त्रुटी: कृपया तुमची API Key .env फाईलमध्ये जोडा." 
        : "AI Configuration Error: Please add your GEMINI_API_KEY to the .env file.");
    }

    // gemini-1.5 series is decommissioned. Use 2.5 or 3.1.
    const selectedModel = input.engine === 'Gemini' ? 'gemini-3.1-pro-preview' : 'gemini-2.5-flash';

    let attempts = 0;
    const maxAttempts = 3; 
    let lastError: any = null;

    while (attempts < maxAttempts) {
      try {
        const {output} = await playerRecommendationPrompt(input, {
          model: googleAI.model(selectedModel)
        });
        if (!output) throw new Error('AI returned an empty response.');
        return output;
      } catch (error: any) {
        lastError = error;
        attempts++;
        
        const errorMsg = error?.message || String(error);
        console.error(`AI Recommendation Attempt ${attempts} failed:`, errorMsg);

        if (attempts >= maxAttempts) {
          throw new Error(`AI Service Busy (Attempt ${attempts}). Please check your API key or try again later.`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
      }
    }
    throw lastError || new Error('Failed to generate recommendations.');
  },
);

export async function playerRecommendation(input: PlayerRecommendationInput): Promise<PlayerRecommendationOutput> {
  return playerRecommendationFlow(input);
}
