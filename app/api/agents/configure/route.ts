import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { AgentConfig, db, tools } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// ==========================================
// POST: Generate & Create New Agent
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const apiKey =
      process.env.GOOGLE_CLOUD_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing in environment variables." },
        { status: 500 },
      );
    }

    const aiTools = await db
      .select({
        slug: tools.slug,
      })
      .from(tools);

    const ai = new GoogleGenAI({ apiKey });
    const formattedPrompt = AgentConfigSystemPrompt.replace(
      "{USER_PROMPT}",
      prompt,
    ).replace("{AVAILABLE_TOOLS}", aiTools.map((t) => t.slug).join(", "));

    // Using currently active, stable model IDs
    const modelsToTry = [
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
    ];
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

        if (!response.text) continue;

        const aiOutput = JSON.parse(response.text);

        // Save final Agent Config to DB when ready
        if (aiOutput.status === "ready") {
          const agentId = crypto.randomUUID();
          const configData = aiOutput.config || aiOutput;

          const dbResult = await db
            .insert(AgentConfig)
            .values({
              ...configData,
              agentImage:
                "https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=" +
                agentId,
              agentId: agentId,
              userEmail: user?.primaryEmailAddress?.emailAddress || "unknown",
              status: configData.status || "active",
            })
            .returning();

          return NextResponse.json({
            status: "ready",
            config: dbResult[0],
          });
        }

        if (aiOutput.status === "needs_clarification") {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed: ${err?.message || err}`);
      }
    }

    if (!responseText) {
      throw (
        lastError ||
        new Error("Failed to receive output from all candidate models.")
      );
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

// ==========================================
// PUT: Update Existing Agent Configuration (Edit Sheet)
// ==========================================
export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Destructure identifiers and strip fields that shouldn't be blindly overwritten
    const { id, agentId, createdAt, userEmail, ...updateData } = body;

    if (!id && !agentId) {
      return NextResponse.json(
        { error: "Agent ID is required for updating." },
        { status: 400 },
      );
    }

    // Update record in database using Drizzle
    const updatedRecord = await db
      .update(AgentConfig)
      .set(updateData)
      .where(id ? eq(AgentConfig.id, id) : eq(AgentConfig.agentId, agentId))
      .returning();

    if (!updatedRecord.length) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agent: updatedRecord[0],
    });
  } catch (error: any) {
    console.error("Error updating agent configuration:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update agent configuration." },
      { status: 500 },
    );
  }
}
