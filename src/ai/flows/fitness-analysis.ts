'use server';
/**
 * @fileOverview A Genkit flow for expert fitness test analysis and instructions.
 *
 * - analyzeFitness - Analyzes scores and provides drills.
 * - getTestInstructions - Explains how to perform tests.
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
    You provide encouraging, data-driven feedback, correct form errors based on descriptions, and suggest specific drills to improve performance. 
    Use simple, clear language suitable for students and teachers.
    
    LOGIC:
    - If the score is Below Average: Suggest 3 'Level 1' beginner exercises to improve.
    - If the score is Average: Provide a 'Maintenance' tip and one challenge to reach the next level.
    - If the score is Excellent: Congratulate them and suggest how this strength helps in sports.
    
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
    system: `You are an expert AI Sports Scientist. Provide clear instructions for fitness tests.
    - For Beep Test: Focus on pacing and 'turn' technique. Remind that test ends after failing twice.
    - For Sit and Reach: Emphasize locked knees and slow reach (no jerking). Hold for 2 seconds.
    - For Partial Curl-Up: Feet flat, slide fingers 10-12cm, head returns to mat every rep.`,
    prompt: `Explain the ${input.testName} in ${input.language}.`,
  });
  return text;
}
