import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(
      body.message
    );

    const response = result.response.text();

    return Response.json({
      success: true,
      analytics: response,
      reply: response,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "AI failed" },
      { status: 500 }
    );
  }
}