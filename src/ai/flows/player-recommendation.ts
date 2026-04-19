'use server';
/**
 * @fileOverview A Genkit flow for generating personalized recommendations for school sports players.
 *
 * - playerRecommendation - A function that generates AI-powered recommendations for a player.
 * - PlayerRecommendationInput - The input type for the playerRecommendation function.
 * - PlayerRecommendationOutput - The return type for the playerRecommendation function.
 */

import {ai} from '@/ai/genkit';
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
  sport: z.string().optional().describe('Primary sport of the player.'),
  history: z.string().optional().describe('Whether the player has sport history (Yes/No).'),
  histDetail: z.string().optional().describe('Details of sport history, if any.'),
  medical: z.string().optional().describe('Any medical conditions or emergency notes.'),
  fitnessFlexibility: z.string().optional().describe('Flexibility score from fitness test.'),
  fitnessEndurance: z.string().optional().describe('Endurance score from fitness test.'),
  fitnessScore: z.string().optional().describe('Overall fitness score.'),
  fitnessStatus: z.string().optional().describe('Fitness status (e.g., Fit, Need Training).'),
  sportSkill1: z.string().optional().describe('First specific skill for their primary sport.'),
  sportSkill2: z.string().optional().describe('Second specific skill for their primary sport.'),
  sportSkillScore: z.string().optional().describe('Overall skill score for their primary sport.'),
  pastHealthIncidents: z.string().optional().describe('Summarized list of past health incidents for the player.'),
});
export type PlayerRecommendationInput = z.infer<typeof PlayerRecommendationInputSchema>;

const PlayerRecommendationOutputSchema = z.object({
  summary: z.string().describe('A brief overall summary of the player\'s profile and key takeaways.'),
  trainingPlan: z.string().describe('Personalized training plan recommendations for the player.'),
  healthAdvice: z.string().describe('Health-related advice and suggestions for the player.'),
  performanceSuggestions: z.string().describe('Specific suggestions for improving performance in their sport.'),
});
export type PlayerRecommendationOutput = z.infer<typeof PlayerRecommendationOutputSchema>;

export async function playerRecommendation(input: PlayerRecommendationInput): Promise<PlayerRecommendationOutput> {
  return playerRecommendationFlow(input);
}

const playerRecommendationPrompt = ai.definePrompt({
  name: 'playerRecommendationPrompt',
  input: {schema: PlayerRecommendationInputSchema},
  output: {schema: PlayerRecommendationOutputSchema},
  prompt: `You are an expert school sports coach and health advisor. Your task is to analyze a player's aggregated data and provide personalized recommendations for their athletic development and well-being. Focus on actionable advice for training, health, and performance improvement.

Player Profile:
- Name: {{{name}}}
- Gender: {{{gender}}}
- Standard: {{{std}}}
- Age: {{{age}}}
- Height: {{{height}}} cm
- Weight: {{{weight}}} kg
- BMI: {{{bmi}}}
- Primary Sport: {{{sport}}}
- Sport History: {{{history}}} {{{histDetail}}}
- Medical Conditions: {{{medical}}}

Fitness Assessment:
- Flexibility: {{{fitnessFlexibility}}}
- Endurance: {{{fitnessEndurance}}}
- Overall Fitness Score: {{{fitnessScore}}}
- Fitness Status: {{{fitnessStatus}}}

Sport-Specific Skills ({{sport}}):
- Skill 1: {{{sportSkill1}}}
- Skill 2: {{{sportSkill2}}}
- Skill Score: {{{sportSkillScore}}}

Health Incidents: {{{pastHealthIncidents}}}

Based on the above data, provide a comprehensive summary and personalized recommendations in the following categories. If any data point is missing or not applicable, state that in the summary or implicitly skip it in the recommendations.
`,
});

const playerRecommendationFlow = ai.defineFlow(
  {
    name: 'playerRecommendationFlow',
    inputSchema: PlayerRecommendationInputSchema,
    outputSchema: PlayerRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await playerRecommendationPrompt(input);
    return output!;
  },
);
