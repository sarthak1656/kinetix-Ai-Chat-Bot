import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { AgentConfig, db, tools } from "@/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const user = await currentUser(); // Assuming you have a function to get the current user
    
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing in environment variables." },
        { status: 500 }
      );
    }

    const aiTools = await  db.select({
      slug: tools.slug

    }).from(tools)

    const ai = new GoogleGenAI({ apiKey });
    const formattedPrompt = AgentConfigSystemPrompt.replace("{USER_PROMPT}", prompt).replace("{AVAILABLE_TOOLS}", aiTools.map(t => t.slug).join(", "));

    // Using currently active, stable model IDs
      const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"];
    let responseText: string | undefined;
    let lastError: any;

    for (const model of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: formattedPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: AgentConfigRespSchema,
          },
        });

// TO save final Agent Config
        const aiOutput = JSON.parse(response.text || "{}");
        if (aiOutput.status === "ready") {
          const agentId = crypto.randomUUID();
          const dbResult = await db.insert(AgentConfig).values({
            ...aiOutput.config,
            agentImage: "https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=" + agentId,
            agentId: agentId,
            userEmail: user?.primaryEmailAddress?.emailAddress || "unknown",
          }).returning();

          // Return a structured response matching the frontend's expected format
          return NextResponse.json({
            status: "ready",
            config: dbResult[0],
          });
        }

        if (response.text) {
          responseText = response.text;
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed: ${err?.message || err}`);
      }
    }

    if (!responseText) {
      throw lastError || new Error("Failed to receive output from all candidate models.");
    }

    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Error in agent configuration route:", error);

    const errorMessage =
      error?.status === 503
        ? "Gemini API is currently experiencing high demand. Please try again in a moment."
        : error?.message || "Failed to generate agent configuration.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}