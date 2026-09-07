'use server';
/**
 * @fileOverview A Genkit flow for a conversational AI sports coaching assistant.
 * Adheres to strict AI Safety boundaries, institutional neutral identity, and medical red-flag triage.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const CoachChatInputSchema = z.object({
  message: z.string().describe("The user's current message."),
  history: z.array(MessageSchema).describe('The conversation history.'),
  playerContext: z.string().optional().describe('Context about the student being discussed.'),
  teacherContext: z.string().optional().describe('Context about the teacher/coach from their profile.'),
  language: z.string().describe('The language for the response (English or Marathi).'),
  engine: z.enum(['Genkit', 'Gemini Pro']).optional().describe('The selected AI engine.'),
});
export type CoachChatInput = z.infer<typeof CoachChatInputSchema>;

import { detectEmergencyRedFlags } from '@/lib/ai-safety';

function getEmergencyResponse(redFlag: string, isMarathi: boolean): string {
  if (isMarathi) {
    return `🚨 **तातडीचा वैद्यकीय इशारा (Emergency Medical Protocol):**\n\n` +
      `**लक्षण:** ${redFlag}\n\n` +
      `⚠️ **महत्त्वाची सूचना:** हा एआय क्रीडा सहाय्यक आहे, वैद्यकीय डॉक्टर नाही. या लक्षणांसाठी तात्काळ खालील उपाय करा:\n` +
      `१. **खेळाडूचा सराव त्वरित थांबवा** आणि त्याला स्थिर व सुरक्षित स्थितीत ठेवा.\n` +
      `२. जखमेवर किंवा दुखऱ्या भागावर कोणताही अनावश्यक दबाव आणू नका.\n` +
      `३. **शाळेच्या वैद्यकीय कक्षाशी किंवा जवळच्या प्राथमिक आरोग्य केंद्राशी (PHC) तात्काळ संपर्क साधा.**\n` +
      `४. आवश्यकता भासल्यास १०८ रुग्णवाहिका बोलवा.\n\n` +
      `*वैद्यकीय तपासणीशिवाय खेळाडूला पुन्हा खेळू देऊ नका.*`;
  }

  return `🚨 **EMERGENCY MEDICAL ADVISORY:**\n\n` +
    `**Identified Concern:** ${redFlag}\n\n` +
    `⚠️ **Critical Disclaimer:** I am an AI sports coaching assistant, not a medical professional. The symptoms described require immediate clinical evaluation:\n` +
    `1. **Halt training immediately** and ensure the student is resting comfortably in a safe position.\n` +
    `2. Do not attempt forceful manipulation or weight-bearing on the affected area.\n` +
    `3. **Escalate to the school medical officer or nearest Primary Health Centre (PHC) urgently.**\n` +
    `4. Call emergency services (108) if breathing, consciousness, or severe trauma is observed.\n\n` +
    `*Do not allow return to athletic play without qualified medical clearance.*`;
}

function getCoachExpertResponse(message: string, language: string, studentContext?: string): string {
  const isMarathi = language === 'Marathi';
  const redFlagCheck = detectEmergencyRedFlags(message);
  if (redFlagCheck.isEmergency) {
    return getEmergencyResponse(redFlagCheck.redFlag, isMarathi);
  }

  const lower = message.toLowerCase();

  if (lower.includes('diet') || lower.includes('food') || lower.includes('आहार') || lower.includes('जेवण') || lower.includes('पोषण')) {
    return isMarathi
      ? `🏆 **क्रीडा सहाय्यक (आहार व पोषण मार्गदर्शन):**\n\nखेळाडूंच्या स्टॅमिनासाठी स्थानिक व संतुलित आहार महत्त्वाचा आहे:\n१. **सकाळ:** मोड आलेले मूग/चणे, गूळ, शेंगदाणे आणि केळी.\n२. **दुपार:** ज्वारी/बाजरी भाकरी, डाळ, पालेभाज्या आणि ताक.\n३. **सराव नंतर:** उकडलेली अंडी किंवा चणे व भरपूर पाणी (ORS/लिंबू पाणी).\n४. **रात्र:** हलके जेवण व झोपण्यापूर्वी १ ग्लास हळद दूध.\n\n*टीप: हा सर्वसाधारण क्रीडा पोषण सल्ला आहे. विशिष्ट आरोग्यासाठी वैद्यकीय सल्ला घ्यावा.*`
      : `🏆 **AI Sports Coaching Assistant (Nutrition Guidelines):**\n\nFor balanced youth athletic endurance, adhere to regional whole-food principles:\n1. **Morning:** Sprouted legumes (Moong/Chana), jaggery, roasted peanuts, and bananas.\n2. **Midday:** Bhakri/Roti with lentils, seasonal greens, and buttermilk.\n3. **Post-Training:** Boiled eggs or roasted gram with clean electrolyte hydration.\n4. **Evening:** Wholesome light meal and warm milk prior to sleep.\n\n*Note: This is general athletic education, not medical nutrition therapy.*`;
  }

  if (lower.includes('warm') || lower.includes('सराव') || lower.includes('drill') || lower.includes('speed') || lower.includes('stamina') || lower.includes('वेग')) {
    return isMarathi
      ? `⚡ **क्रीडा सहाय्यक (प्रशिक्षण व वेग मार्गदर्शन):**\n\n१. **वॉर्म-अप (१० मिनिटे):** जॉगिंग, हाय-नीज, बट-किक्स आणि डायनॅमिक स्ट्रेचिंग.\n२. **कौशल्य सराव (३० मिनिटे):** खेळाचे मुख्य तंत्र (कबड्डी रेड/टॅकल, व्हॉलीबॉल सर्व्हिस, खो-खो पोल टर्न).\n३. **कंडिशनिंग (१५ मिनिटे):** १०x४ शटल रन, स्प्रिंट्स आणि पुश-अप्स.\n४. **कुल-डाऊन (५ मिनिटे):** संथ चालणे व डीप ब्रीदिंग.`
      : `⚡ **AI Sports Coaching Assistant (Training & Conditioning):**\n\n1. **Warm-Up (10 min):** Dynamic mobility, light jog, high knees, and joint rotations.\n2. **Technical Drills (30 min):** Sport-specific mechanics (Kabaddi footwork, Volleyball floating serve, Kho-Kho turns).\n3. **Conditioning (15 min):** 10x4m shuttle runs, short acceleration sprints, core stability.\n4. **Cool-Down (5 min):** Controlled breathing and static stretching.`;
  }

  if (lower.includes('injury') || lower.includes('pain') || lower.includes('दुखापत') || lower.includes('त्रास') || lower.includes('सुज')) {
    return isMarathi
      ? `🩹 **क्रीडा सहाय्यक (प्रथमोपचार प्राथमिक तत्त्वे):**\n\n१. **R.I.C.E. तत्त्व वापरा:**\n   - **Rest (विश्रांती):** दुखऱ्या अवयवावर ताण देऊ नका.\n   - **Ice (बर्फ):** १५-२० मिनिटे कापडात गुंडाळून बर्फ लावा.\n   - **Compression (क्रेप पट्टी):** हलके बांधा, जास्त आवळू नका.\n   - **Elevation (उंचावर ठेवणे):** सूज कमी करण्यासाठी अवयव वर ठेवा.\n२. वेदना तीव्र असल्यास किंवा २४ तासांत सूज न कमी झाल्यास **वैद्यकीय अधिकाऱ्यांशी संपर्क साधा**.\n\n*सूचना: एआय वैद्यकीय निदान करत नाही.*`
      : `🩹 **AI Sports Coaching Assistant (First Aid & Recovery Protocol):**\n\n1. **Apply the R.I.C.E. protocol for minor sprains/strains:**\n   - **Rest:** Discontinue training immediately.\n   - **Ice:** Apply cold pack wrapped in cloth for 15-20 minutes.\n   - **Compression:** Apply gentle elastic bandage.\n   - **Elevation:** Elevate above heart level.\n2. If swelling persists or pain worsens, **consult a qualified physician or health center immediately**.\n\n*Disclaimer: This is educational first aid advice, not a clinical diagnosis.*`;
  }

  return isMarathi
    ? `🎯 **क्रीडा सहाय्यक (Waghamba Sports Hub):**\n\nखेळाडूंच्या सातत्यपूर्ण प्रगतीसाठी नियोजन आणि शिस्त महत्त्वाची आहे.\n- नियमित सरावाची नोंद ठेवा आणि मासिक उद्दिष्टे पूर्ण करा.\n- सराव काळात खेळाडूंची ऊर्जा, हायड्रेशन आणि सुरक्षेकडे लक्ष द्या.\n- खेळाडूंना आत्मविश्वास देणारा सकारात्मक दृष्टिकोन ठेवा.`
    : `🎯 **AI Sports Coaching Assistant (Waghamba Sports Hub):**\n\nStructured progression and consistent practice build athletic excellence.\n- Track regular practice milestones and monitor monthly progress targets.\n- Ensure student hydration, safety, and proper warm-ups prior to all high-intensity drills.\n- Promote sportsmanship, team camaraderie, and resilience.`;
}

const coachChatFlow = ai.defineFlow(
  {
    name: 'coachChatFlow',
    inputSchema: CoachChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const isMarathi = input.language === 'Marathi';

    // Step 1: Pre-inference Red-Flag Screening
    const redFlagCheck = detectEmergencyRedFlags(input.message);
    if (redFlagCheck.isEmergency) {
      return getEmergencyResponse(redFlagCheck.redFlag, isMarathi);
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
      return getCoachExpertResponse(input.message, input.language, input.playerContext);
    }

    const selectedModel = 'gemini-1.5-flash';
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const { text } = await ai.generate({
          model: googleAI.model(selectedModel),
          config: {
            maxOutputTokens: 2048,
            temperature: 0.5,
          },
          system: `You are an AI Sports Coaching Assistant for Waghamba Sports Health Hub. 
          You provide supportive, evidence-based sports training, physical education, and athletic conditioning advice for Indian school students.
          
          CRITICAL SAFETY RULES:
          1. You are an AI assistant, NOT a doctor or medical professional. NEVER issue definitive medical diagnoses.
          2. For any significant injury, fracture, severe pain, head trauma, breathing trouble, or persistent swelling, IMMEDIATELY advise professional medical consultation.
          3. Emphasize student safety, proper hydration, age-appropriate load, and warm-up/cool-down.
          4. Respond entirely in ${input.language}.
          5. Institutional context: ${input.teacherContext || 'Physical Education Program at Waghamba School'}.
          6. Student context: ${input.playerContext || 'General coaching inquiry'}.`,
          messages: input.history.map((m) => ({
            role: m.role,
            content: [{ text: m.content }],
          })),
          prompt: input.message,
        });

        if (text) {
          // Post-inference check: ensure medical disclaimer if injury/pain discussed
          const lower = input.message.toLowerCase();
          if (lower.includes('injury') || lower.includes('pain') || lower.includes('दुखापत') || lower.includes('त्रास')) {
            const disclaimer = isMarathi
              ? `\n\n*(सूचना: हा एआय सल्ला प्राथमिक शैक्षणिक स्वरूपाचा आहे. कोणत्याही तीव्र किंवा कायम राहणाऱ्या दुखण्यासाठी त्वरित वैद्यकीय तपासणी करावी.)*`
              : `\n\n*(Disclaimer: This is general educational guidance. Always consult a qualified medical professional for persistent or severe symptoms.)*`;
            return text + disclaimer;
          }
          return text;
        }
        break;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) break;
        await new Promise((resolve) => setTimeout(resolve, 1500));
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
