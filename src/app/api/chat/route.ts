import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { GEMINI_MODEL_NAME } from "@/ai/genkit";

// Rate limiting map: Client IP / Key -> { count: number, resetAt: number }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20; // 20 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message exceeds 2000 character limit"),
  context: z.string().max(1000).optional()
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const now = Date.now();
    const rateData = rateLimitMap.get(clientIp);

    if (rateData && now < rateData.resetAt) {
      if (rateData.count >= RATE_LIMIT_MAX) {
        return Response.json(
          { success: false, error: "Too many requests. Please wait a moment before asking AI again." },
          { status: 429 }
        );
      }
      rateData.count += 1;
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }

    // 2. Request Body Validation
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = ChatRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return Response.json(
        { success: false, error: parseResult.error.errors[0]?.message || "Invalid chat request" },
        { status: 400 }
      );
    }

    const { message, context } = parseResult.data;

    // 3. API Key check
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { 
          success: true, 
          message: "क्रीडा सहाय्यक सध्या ऑफलाइन मोडमध्ये आहे. कृपया इंटरनेट किंवा API की तपासा." 
        },
        { status: 200 }
      );
    }

    // 4. Model Inference
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction: "You are the expert Sports & Health Assistant for Waghamba Ashram School PE Coach Sunil Shinde. Provide polite, motivating, and accurate coaching and physical fitness guidance in Marathi and English."
    });

    const promptText = context ? `Context: ${context}\n\nQuestion: ${message}` : message;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
    });

    const responseText = result.response.text();

    return Response.json({
      success: true,
      message: responseText,
    });

  } catch (error: any) {
    console.error("WGB AI Chat Error (sanitized):", error?.message || "Inference error");
    return Response.json(
      { success: false, error: "AI सेवा सध्या तात्पुरती अनुपलब्ध आहे. कृपया काही वेळाने पुन्हा प्रयत्न करा." },
      { status: 500 }
    );
  }
}

