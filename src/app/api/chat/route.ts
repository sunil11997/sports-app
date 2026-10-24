import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { GEMINI_MODEL_NAME } from "@/ai/genkit";
import { 
  resolveVerifiedSession, 
  checkRateLimits, 
  sanitizePromptInput 
} from "@/lib/server-auth";
import { detectEmergencyRedFlags } from "@/lib/ai-safety";

const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message exceeds 2000 character limit"),
  context: z.string().max(1000).optional(),
  language: z.enum(["English", "Marathi"]).default("English"),
});

function getEmergencyResponse(redFlag: string, isMarathi: boolean): string {
  if (isMarathi) {
    return (
      `🚨 **तातडीचा वैद्यकीय इशारा (Emergency Medical Protocol):**\n\n` +
      `**लक्षण:** ${redFlag}\n\n` +
      `⚠️ **महत्त्वाची सूचना:** हा एआय क्रीडा सहाय्यक आहे, वैद्यकीय डॉक्टर नाही. या लक्षणांसाठी तात्काळ खालील उपाय करा:\n` +
      `१. **खेळाडूचा सराव त्वरित थांबवा** आणि त्याला स्थिर व सुरक्षित स्थितीत ठेवा.\n` +
      `२. जखमेवर किंवा दुखऱ्या भागावर कोणताही अनावश्यक दबाव आणू नका.\n` +
      `३. **शाळेच्या वैद्यकीय कक्षाशी किंवा जवळच्या प्राथमिक आरोग्य केंद्राशी (PHC) तात्काळ संपर्क साधा.**\n` +
      `४. आवश्यकता भासल्यास १०८ रुग्णवाहिका बोलवा.\n\n` +
      `*वैद्यकीय तपासणी व अधिकृत प्रमाणपत्राशिवाय खेळाडूला पुन्हा खेळू देऊ नका.*`
    );
  }

  return (
    `🚨 **EMERGENCY MEDICAL ADVISORY:**\n\n` +
    `**Identified Concern:** ${redFlag}\n\n` +
    `⚠️ **Critical Disclaimer:** I am an AI sports coaching assistant, not a medical professional. The symptoms described require immediate clinical evaluation:\n` +
    `1. **Halt training immediately** and ensure the student is resting comfortably in a safe position.\n` +
    `2. Do not attempt forceful manipulation or weight-bearing on the affected area.\n` +
    `3. **Escalate to the school medical officer or nearest Primary Health Centre (PHC) urgently.**\n` +
    `4. Call emergency services (108) if breathing, consciousness, or severe trauma is observed.\n\n` +
    `*Do not allow return to athletic play without qualified clinical medical clearance.*`
  );
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let verifiedUid = "anonymous";
  let schoolTenant = "unknown";

  try {
    // 1. Firebase Authentication & Server-Side Tenant Resolution
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json(
        { 
          success: false, 
          error: "अनधिकृत प्रवेश: कृपया लॉगिन करा (Unauthorized: Firebase session required)." 
        },
        { status: 401 }
      );
    }

    const session = await resolveVerifiedSession(authHeader);
    verifiedUid = session.uid;
    schoolTenant = session.schoolId;

    // 2. Multi-Tenant Rate Limiting & AI Quota Enforcement
    const quotaCheck = checkRateLimits(session.uid, session.schoolId);
    if (!quotaCheck.allowed) {
      return Response.json(
        { 
          success: false, 
          error: quotaCheck.reason || "Too many AI requests. Please wait a moment." 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(quotaCheck.retryAfterSeconds || 60),
          }
        }
      );
    }

    // 3. Request Body Parsing & Strict Schema Validation
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = ChatRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return Response.json(
        { success: false, error: parseResult.error.errors[0]?.message || "Invalid chat request" },
        { status: 400 }
      );
    }

    const { message, context, language } = parseResult.data;
    const isMarathi = language === "Marathi";

    // 4. Emergency Clinical Red-Flag Screening (Supplementary Safeguard)
    const redFlagCheck = detectEmergencyRedFlags(message);
    if (redFlagCheck.isEmergency) {
      return Response.json({
        success: true,
        message: getEmergencyResponse(redFlagCheck.redFlag, isMarathi),
        isEmergency: true,
      });
    }

    // 5. Prompt Injection Defense & Sanitization
    const sanitizedMessage = sanitizePromptInput(message, 1500);
    const sanitizedContext = context ? sanitizePromptInput(context, 800) : "";

    // 6. Provider API Key & Model Configuration
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_KEY_HERE") {
      return Response.json(
        { 
          success: true, 
          message: isMarathi 
            ? "क्रीडा सहाय्यक सध्या ऑफलाइन मोडमध्ये आहे. कृपया इंटरनेट किंवा API की तपासा."
            : "Sports AI assistant is currently running in offline fallback mode."
        },
        { status: 200 }
      );
    }

    // 7. Secure Model Inference with Rigid Safety Guardrails
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction: 
        `You are the expert Sports Coaching & Physical Education Assistant for Ashram School PE Coaches.\n` +
        `Respond politely, accurately, and supportively in ${language}.\n\n` +
        `SAFETY BOUNDARIES:\n` +
        `1. You are an AI athletic coaching assistant, NOT a doctor or clinician.\n` +
        `2. NEVER provide definitive medical diagnoses, drug prescriptions, or autonomous return-to-play clearances.\n` +
        `3. For any severe pain, suspected fractures, head injuries, or respiratory distress, recommend immediate referral to a health professional.\n` +
        `4. Focus on youth athletic development, safe training loads, progressive drills, nutrition, and injury prevention.`
    });

    const promptText = sanitizedContext 
      ? `Context (Anonymized):\n${sanitizedContext}\n\nCoaching Query:\n${sanitizedMessage}` 
      : sanitizedMessage;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
    });

    let responseText = result.response.text();

    // 8. Post-Inference Injury Safety Check
    const lower = sanitizedMessage.toLowerCase();
    if (lower.includes("injury") || lower.includes("pain") || lower.includes("दुखापत") || lower.includes("त्रास")) {
      const disclaimer = isMarathi
        ? `\n\n*(सूचना: हा एआय क्रीडा सल्ला प्राथमिक शैक्षणिक स्वरूपाचा आहे. कोणत्याही तीव्र किंवा कायम राहणाऱ्या दुखण्यासाठी डॉक्टरांचा सल्ला घ्यावा.)*`
        : `\n\n*(Disclaimer: This athletic coaching advice is educational. Consult a qualified healthcare professional for persistent pain or medical evaluation.)*`;
      responseText += disclaimer;
    }

    return Response.json({
      success: true,
      message: responseText,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    // Safe server logging: Log operational status and duration WITHOUT user message or sensitive PII
    console.error(`[WGB AI Audit] UID: ${verifiedUid} | Tenant: ${schoolTenant} | Duration: ${duration}ms | Status: 500`);
    
    return Response.json(
      { 
        success: false, 
        error: "AI सेवा सध्या तात्पुरती अनुपलब्ध आहे. कृपया काही वेळाने पुन्हा प्रयत्न करा." 
      },
      { status: 500 }
    );
  }
}
