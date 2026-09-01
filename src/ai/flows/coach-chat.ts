'use server';
/**
 * @fileOverview A Genkit flow for a conversational AI sports coach.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const CoachChatInputSchema = z.object({
  message: z.string().describe('The user\'s current message.'),
  history: z.array(MessageSchema).describe('The conversation history.'),
  playerContext: z.string().optional().describe('Context about the student being discussed.'),
  teacherContext: z.string().optional().describe('Context about the teacher/coach from their profile.'),
  language: z.string().describe('The language for the response (English or Marathi).'),
  engine: z.enum(['Genkit', 'Gemini Pro']).optional().describe('The selected AI engine.'),
});
export type CoachChatInput = z.infer<typeof CoachChatInputSchema>;

function getCoachExpertResponse(message: string, language: string, studentContext?: string): string {
  const isMarathi = language === 'Marathi';
  const lower = message.toLowerCase();

  if (lower.includes('diet') || lower.includes('food') || lower.includes('आहार') || lower.includes('जेवण') || lower.includes('पोषण')) {
    return isMarathi
      ? `🏆 **क्रीडा मार्गदर्शक (आहार व पोषण सल्ला):**\n\nखेळाडूंच्या उत्तम स्टॅमिनासाठी स्थानिक व पौष्टिक आहार आवश्यक आहे:\n१. **सकाळ:** मोड आलेले मूग, चणे, गूळ आणि केळी.\n२. **दुपार:** ज्वारी/बाजरीची भाकरी, डाळ-भात, हिरव्या पालेभाज्या आणि ताक.\n३. **सराव नंतर:** उकडलेली अंडी किंवा चणे व भरपूर पाणी.\n४. **रात्र:** हलके जेवण व झोपण्यापूर्वी १ ग्लास हळदयुक्त दूध.\n\n*टीप: जंक फूड आणि तेलकट पदार्थ पूर्णपणे टाळा.*`
      : `🏆 **Sports Coach (Nutrition Directive):**\n\nFor high-performance endurance, follow this regional meal blueprint:\n1. **Breakfast:** Sprouted legumes (Moong/Chana), jaggery, peanuts, and seasonal fruit.\n2. **Lunch:** Bhakri/Roti with protein-dense dal, leafy vegetables, and buttermilk.\n3. **Post-Training:** Boiled eggs or chana with clean electrolyte hydration.\n4. **Dinner:** Wholesome light meal and warm milk before bed.\n\n*Avoid packaged foods and excessive refined sugar.*`;
  }

  if (lower.includes('warm') || lower.includes('सराव') || lower.includes('drill') || lower.includes('speed') || lower.includes('stamina') || lower.includes('वेग')) {
    return isMarathi
      ? `⚡ **क्रीडा मार्गदर्शक (प्रशिक्षण व वेग मार्गदर्शन):**\n\n१. **वॉर्म-अप (१० मिनिटे):** जॉगिंग, हाय-नीज, बट-किक्स आणि डायनॅमिक स्ट्रेचिंग.\n२. **कौशल्य सराव (३० मिनिटे):** खेळाचे मुख्य तंत्र (कबड्डी रेड/टॅकल, व्हॉलीबॉल सर्व्हिस, खो-खो पोल टर्न).\n३. **कंडिशनिंग (१५ मिनिटे):** १०x४ शटल रन, स्प्रिंट्स आणि पुश-अप्स.\n४. **कुल-डाऊन (५ मिनिटे):** संथ चालणे व डीप ब्रीदिंग.`
      : `⚡ **Sports Coach (Training & Conditioning):**\n\n1. **Warm-Up (10 min):** Light jog, high knees, butt kicks, and dynamic joint rotations.\n2. **Skill Drills (30 min):** Position-specific drills (Kabaddi footwork, Volleyball jump float, Kho Kho pole turns).\n3. **Conditioning (15 min):** 10x4m shuttle runs, explosive sprints, and core stability.\n4. **Cool-Down (5 min):** Static stretching and deep breath resets.`;
  }

  if (lower.includes('injury') || lower.includes('pain') || lower.includes('दुखापत') || lower.includes('त्रास') || lower.includes('सुज')) {
    return isMarathi
      ? `🩹 **क्रीडा मार्गदर्शक (प्रथमोपचार व रिकव्हरी):**\n\n१. **R.I.C.E. पद्धत वापरा:** Rest (विश्रांती), Ice (बर्फ लावणे १५ मिनिटे), Compression (क्रेप पट्टी), Elevation (अवयव वर ठेवणे).\n२. दुखऱ्या भागाला जास्त ताण देऊ नका.\n३. वेदना जास्त असल्यास त्वरित प्राथमिक आरोग्य केंद्र किंवा शाळेच्या वैद्यकीय कक्षाशी संपर्क साधा.`
      : `🩹 **Sports Coach (Injury Protocol):**\n\n1. **Apply R.I.C.E. immediately:** Rest, Ice (15 mins), Compression bandage, Elevation above heart level.\n2. Do not force movement on inflamed muscles or joints.\n3. Escalate to the health center if swelling persists over 24 hours.`;
  }

  return isMarathi
    ? `🎯 **क्रीडा मार्गदर्शक (क्रीडा केंद्र):**\n\nखेळाडूच्या प्रगतीसाठी शिस्त आणि नियमित सराव अत्यंत महत्त्वाचा आहे.\n- **सध्याचा सल्ला:** खेळाडूची ताकद ओळखून त्याला विशिष्ट भूमिकेत सराव द्या.\n- दररोज सरावाची नोंद ठेवा आणि मासिक टार्गेट्स पूर्ण करण्यावर भर द्या.\n- खेळाडूचा आत्मविश्वास वाढवण्यासाठी त्याला सकारात्मक प्रोत्साहन द्या.`
    : `🎯 **Sports Coach (Sports Center):**\n\nAthletic mastery is built on consistent discipline and structured repetition.\n- **Action Item:** Focus on progressive overload in weekly drills.\n- Monitor daily recovery and track monthly target goals in the registry.\n- Encourage mental resilience and positive teammate communication.`;
}

const coachChatFlow = ai.defineFlow(
  {
    name: 'coachChatFlow',
    inputSchema: CoachChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
      return getCoachExpertResponse(input.message, input.language, input.playerContext);
    }

    const selectedModel = 'gemini-1.5-flash';
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        const {text} = await ai.generate({
          model: googleAI.model(selectedModel),
          config: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          },
          system: `You are Coach Sunil Deshmukh, the head physical education teacher and sports coach at Waghamba Ashram Shala. 
          INSTITUTIONAL CONTEXT: ${input.teacherContext || 'Acting Head Coach at Waghamba'}
          IMPORTANT: Respond entirely in ${input.language}.
          CONTEXT ON CURRENT STUDENT: ${input.playerContext || 'General coaching inquiry'}`,
          messages: input.history.map(m => ({
            role: m.role,
            content: [{text: m.content}]
          })),
          prompt: input.message,
        });
        
        if (text) return text;
        break;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) break;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    return getCoachExpertResponse(input.message, input.language, input.playerContext);
  }
);

export async function coachChat(input: CoachChatInput): Promise<string> {
  try {
    return await coachChatFlow(input);
  } catch (err) {
    return getCoachExpertResponse(input.message, input.language, input.playerContext);
  }
}

