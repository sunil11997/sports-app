'use server';
/**
 * @fileOverview A Genkit flow for generating personalized recommendations for school sports players.
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

const playerRecommendationFlow = ai.defineFlow(
  {
    name: 'playerRecommendationFlow',
    inputSchema: PlayerRecommendationInputSchema,
    outputSchema: PlayerRecommendationOutputSchema,
  },
  async (input) => {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error("AI Configuration Error: Missing API Key.");
    }

    const selectedModel = 'gemini-1.5-flash';
    let attempts = 0;
    const maxAttempts = 2; 

    while (attempts < maxAttempts) {
      try {
        const {output} = await playerRecommendationPrompt(input, {
          model: googleAI.model(selectedModel)
        });
        if (!output) throw new Error('AI returned an empty response.');
        return output;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    throw new Error('Failed to generate recommendations after retries.');
  },
);

export async function playerRecommendation(input: PlayerRecommendationInput): Promise<PlayerRecommendationOutput> {
  return playerRecommendationFlow(input);
}
