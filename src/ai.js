import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [googleAI({ apiKey: "AIzaSyDHtj3zRNSu_0XpyqsJKFpr1oa2BTitIQQ" })],
});

export async function askAI(text) {
  const res = await ai.generate(text);
  return res.text;
}