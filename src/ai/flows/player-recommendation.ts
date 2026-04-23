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
  sports: z.array(z.string()).describe('List of sports the player participates in.'),
  history: z.string().optional().describe('Whether the player has sport history (Yes/No).'),
  histDetail: z.string().optional().describe('Details of sport history, if any.'),
  medical: z.string().optional().describe('Any medical conditions or emergency notes.'),
  language: z.string().describe('The language for the output (English or Marathi).'),
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
  prompt: `You are an expert school sports coach and health advisor. Your task is to analyze a player's aggregated data and provide personalized recommendations for their athletic development and well-being.

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

Skills Context:
- Primary/Secondary Score: {{{sportSkillScore}}}
{{#if detailedKabaddiSkills}}
- Detailed Kabaddi Analysis:
{{#each detailedKabaddiSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedVolleyballSkills}}
- Detailed Volleyball Analysis:
{{#each detailedVolleyballSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedHandballSkills}}
- Detailed Handball Analysis:
{{#each detailedHandballSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedKhoKhoSkills}}
- Detailed Kho Kho Analysis:
{{#each detailedKhoKhoSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedRunningSkills}}
- Detailed Running Analysis:
{{#each detailedRunningSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedShotPutSkills}}
- Detailed Shot Put Analysis:
{{#each detailedShotPutSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedJavlineSkills}}
- Detailed Javelin Analysis:
{{#each detailedJavlineSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedLongJumpSkills}}
- Detailed Long Jump Analysis:
{{#each detailedLongJumpSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}
{{#if detailedHighJumpSkills}}
- Detailed High Jump Analysis:
{{#each detailedHighJumpSkills}}
  * {{{@key}}}: {{{this}}}/10
{{/each}}
{{/if}}

Health Context: {{{pastHealthIncidents}}}

Based on this granular data, provide highly specific recommendations. Analyze which specific tests (e.g., endurance vs agility) or technical moves (for the selected sports) need more work. Focus on actionable advice for training, health, and performance improvement. Use a professional, encouraging tone suitable for a school environment.
`,
});

const playerRecommendationFlow = ai.defineFlow(
  {
    name: 'playerRecommendationFlow',
    inputSchema: PlayerRecommendationInputSchema,
    outputSchema: PlayerRecommendationOutputSchema,
  },
  async (input) => {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      try {
        const {output} = await playerRecommendationPrompt(input);
        return output!;
      } catch (error: any) {
        lastError = error;
        attempts++;
        // Check if error is transient (503, demand spikes, or generic unavailable)
        const isTransient = 
          error.message?.includes('503') || 
          error.message?.includes('UNAVAILABLE') || 
          error.message?.includes('demand');

        if (!isTransient || attempts >= maxAttempts) {
          throw error;
        }
        // Wait with simple exponential backoff: 1s, 2s, 3s...
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    throw lastError || new Error('Failed to generate AI recommendations after multiple attempts.');
  },
);
