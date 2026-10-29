import { AgentConfig, db } from "@/db";
import { executeAgent } from "@/lib/execute-agent";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { agentId, agentConfig, input } = body as {
      agentId?: unknown;
      agentConfig?: { agentId?: unknown };
      input?: unknown;
    };
    const requestedAgentId =
      typeof agentId === "string" ? agentId : agentConfig?.agentId;

    if (typeof requestedAgentId !== "string" || !requestedAgentId.trim()) {
      return NextResponse.json(
        { error: "Agent ID is required." },
        { status: 400 },
      );
    }
    if (input !== undefined && input !== null && typeof input !== "string") {
      return NextResponse.json(
        { error: "Input must be a string." },
        { status: 400 },
      );
    }

    const [agentConfigData] = await db
      .select()
      .from(AgentConfig)
      .where(
        and(
          eq(AgentConfig.agentId, requestedAgentId.trim()),
          eq(AgentConfig.userEmail, userEmail),
        ),
      );

    if (!agentConfigData) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const result = await executeAgent(
      agentConfigData,
      userEmail,
      typeof input === "string" ? input : "",
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error running agent:", error);
    return NextResponse.json(
      { error: "Failed to run agent." },
      { status: 500 },
    );
  }
}
