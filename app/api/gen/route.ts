import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // Ensure this is set in your .env.local
});

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming FormData
    const formData = await request.formData();
    const image1 = formData.get("image1") as File;
    const image2 = formData.get("image2") as File;
    const userPrompt = formData.get("prompt") as string;

    if (!image1 || !image2 || !userPrompt) {
      return NextResponse.json(
        { error: "Missing required inputs (image1, image2, or prompt)" },
        { status: 400 }
      );
    }

    // 2. Convert Files to Base64 buffers
    const image1Buffer = Buffer.from(await image1.arrayBuffer()).toString("base64");
    const image2Buffer = Buffer.from(await image2.arrayBuffer()).toString("base64");

    // 3. Construct the payload for Gemini
    // We combine the specific user prompt with the two images
    const prompt = [
      { text: userPrompt },
      {
        inlineData: {
          mimeType: image1.type || "image/png",
          data: image1Buffer,
        },
      },
      {
        inlineData: {
          mimeType: image2.type || "image/png",
          data: image2Buffer,
        },
      },
    ];

    // 4. Call the Gemini API
    // Using 'gemini-2.5-flash-image' (Nano Banana) for speed/cost [cite: 5, 842]
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["IMAGE"], // Force image-only response [cite: 781]
        imageConfig: {
          aspectRatio: "3:4", // Portrait mode (864x1184) 
        },
      },
    });

    // 5. Extract and return the Base64 string
    const resultPart = response.candidates?.[0]?.content?.parts?.[0];

    if (resultPart && resultPart.inlineData && resultPart.inlineData.data) {
      return NextResponse.json({
        result: resultPart.inlineData.data, // This is the raw base64 string
      });
    } else {
      throw new Error("No image data received from Gemini.");
    }

  } catch (error: any) {
    console.error("Virtual Try-On Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate try-on image" },
      { status: 500 }
    );
  }
}