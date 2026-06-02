import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Reverted to gemini-1.5-flash for stable institutional performance
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: (body as any).message || "" }] }],
    });

    const response = result.response.text();

    return Response.json({
      success: true,
      message: response,
    });

  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
