import { AgentConfig, db } from "@/db";
import { composio } from "@/lib/composio";
import { getOrCreateAgentSession } from "@/lib/get-agent-comoposio-session";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { toolSlug, agentId } = body as Record<string, unknown>;
    if (
      typeof toolSlug !== "string" ||
      !toolSlug.trim() ||
      typeof agentId !== "string" ||
      !agentId.trim()
    ) {
      return NextResponse.json(
        { error: "Agent ID and tool slug are required." },
        { status: 400 },
      );
    }

    const requestedAgentId = agentId.trim();
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [agentConfig] = await db
      .select()
      .from(AgentConfig)
      .where(
        and(
          eq(AgentConfig.agentId, requestedAgentId),
          eq(AgentConfig.userEmail, email),
        ),
      );

    if (!agentConfig) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    if (
      !Array.isArray(agentConfig.tools) ||
      !agentConfig.tools.every((slug) => typeof slug === "string")
    ) {
      console.error("Invalid tools configuration for agent:", requestedAgentId);
      return NextResponse.json(
        { error: "Agent tools configuration is invalid." },
        { status: 500 },
      );
    }

    const requestedSlug = toolSlug.trim();
    if (
      !agentConfig.tools.some(
        (slug) => slug.toLowerCase() === requestedSlug.toLowerCase(),
      )
    ) {
      return NextResponse.json(
        { error: "This tool is not configured for the agent." },
        { status: 403 },
      );
    }

    const session = await getOrCreateAgentSession(agentConfig, email);
    const callbackUrl = new URL("/dashboard/agents", req.nextUrl.origin);
    callbackUrl.searchParams.set("connectAgentId", requestedAgentId);
    const connectionRequest = await session.authorize(requestedSlug, {
      callbackUrl: callbackUrl.toString(),
    });
    if (!connectionRequest.redirectUrl) {
      throw new Error("Composio did not return an authorization URL.");
    }

    return NextResponse.json({ redirectUrl: connectionRequest.redirectUrl });
  } catch (error) {
    console.error("Error starting tool connection:", error);
    return NextResponse.json(
      { error: "Failed to start tool connection." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { toolSlug, agentId } = body as Record<string, unknown>;
    if (
      typeof toolSlug !== "string" ||
      !toolSlug.trim() ||
      typeof agentId !== "string" ||
      !agentId.trim()
    ) {
      return NextResponse.json(
        { error: "Agent ID and tool slug are required." },
        { status: 400 },
      );
    }

    const requestedAgentId = agentId.trim();
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [agentConfig] = await db
      .select()
      .from(AgentConfig)
      .where(
        and(
          eq(AgentConfig.agentId, requestedAgentId),
          eq(AgentConfig.userEmail, email),
        ),
      );

    if (!agentConfig) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    if (
      !Array.isArray(agentConfig.tools) ||
      !agentConfig.tools.every((slug) => typeof slug === "string")
    ) {
      console.error("Invalid tools configuration for agent:", requestedAgentId);
      return NextResponse.json(
        { error: "Agent tools configuration is invalid." },
        { status: 500 },
      );
    }

    const requestedSlug = toolSlug.trim();
    if (
      !agentConfig.tools.some(
        (slug) => slug.toLowerCase() === requestedSlug.toLowerCase(),
      )
    ) {
      return NextResponse.json(
        { error: "This tool is not configured for the agent." },
        { status: 403 },
      );
    }

    const session = await getOrCreateAgentSession(agentConfig, email);
    const toolkits = await session.toolkits();
    const toolkit = toolkits.items.find(
      (item) => item.slug.toLowerCase() === requestedSlug.toLowerCase(),
    );
    const connectedAccountId =
      toolkit?.connection?.connectedAccount?.id ?? null;

    if (!connectedAccountId || !toolkit?.connection?.isActive) {
      return NextResponse.json(
        { error: "No active connection was found for this tool." },
        { status: 404 },
      );
    }

    await composio.connectedAccounts.delete(connectedAccountId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting tool:", error);
    return NextResponse.json(
      { error: "Failed to disconnect tool." },
      { status: 500 },
    );
  }
}
