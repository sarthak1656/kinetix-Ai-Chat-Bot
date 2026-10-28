import { AgentConfig, db } from "@/db";
import { getOrCreateAgentSession } from "@/lib/get-agent-comoposio-session";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required." },
        { status: 400 },
      );
    }

    const [agentConfig] = await db
      .select()
      .from(AgentConfig)
      .where(
        and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, email)),
      );

    if (!agentConfig) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const allowedTools = agentConfig.tools;
    if (
      allowedTools !== null &&
      allowedTools !== undefined &&
      (!Array.isArray(allowedTools) ||
        !allowedTools.every((slug) => typeof slug === "string"))
    ) {
      console.error("Invalid tools configuration for agent:", agentId);
      return NextResponse.json(
        { error: "Agent tools configuration is invalid." },
        { status: 500 },
      );
    }

    if (!allowedTools?.length) {
      return NextResponse.json([]);
    }

    const session = await getOrCreateAgentSession(agentConfig, email);
    const toolKitResult = await session.toolkits();

    const tools = allowedTools.map((slug) => {
      const toolKit = toolKitResult.items.find(
        (item) => item.slug.toLowerCase() === slug.toLowerCase(),
      );
      return {
        slug,
        name: toolKit?.name,
        logo: toolKit?.logo,
        connected: toolKit?.connection?.isActive ?? false,
        connectedAccountId: toolKit?.connection?.connectedAccount?.id ?? null,
      };
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error("Error loading agent tools:", error);
    return NextResponse.json(
      { error: "Failed to load agent tools." },
      { status: 500 },
    );
  }
}
