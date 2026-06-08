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

export async function analyzeFitness(input: FitnessAnalysisInput): Promise<FitnessAnalysisOutput> {
  const {output} = await ai.generate({
    model: googleAI.model('gemini-2.5-flash'),
    system: `You are an expert AI Sports Scientist and Fitness Coach. Your goal is to analyze fitness test results for school-age students (ages 6-18). 
    IMPORTANT: Respond entirely in ${input.language}.`,
    prompt: `Analyze this result: Age: ${input.age}, Gender: ${input.gender}, Test: ${input.testName}, Score: ${input.score}`,
    output: {schema: FitnessAnalysisOutputSchema},
  });
  return output!;
}

const InstructionInputSchema = z.object({
  testName: z.enum(['Beep Test', 'Sit and Reach', 'Partial Curl-Up']),
  language: z.string(),
});

export async function getTestInstructions(input: z.infer<typeof InstructionInputSchema>): Promise<string> {
  const {text} = await ai.generate({
    model: googleAI.model('gemini-2.5-flash'),
    system: `You are an expert AI Sports Scientist. Provide clear instructions for fitness tests.`,
    prompt: `Explain the ${input.testName} in ${input.language}.`,
  });
  return text;
}
