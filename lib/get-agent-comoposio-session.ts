import { AgentConfig, db } from "@/db";
import { composio } from "@/lib/composio";
import { eq } from "drizzle-orm";

type AgentSessionConfig = Pick<
  typeof AgentConfig.$inferSelect,
  "agentId" | "composioSessionId" | "tools"
>;

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

// Tools implemented in our own code (not Composio toolkits).
export const LOCAL_TOOL_SLUGS = ["browserbase"];

// Legacy/mismatched slugs -> valid Composio toolkit slugs (match the `tools` table).
const SLUG_ALIASES: Record<string, string> = {
  serpsearch: "serpapi",
  websearch: "tavily",
};

export function toComposioToolkits(tools: string[]): string[] {
  const mapped = tools
    .map((slug) => SLUG_ALIASES[slug] ?? slug)
    .filter((slug) => !LOCAL_TOOL_SLUGS.includes(slug));
  return [...new Set(mapped)];
}

export async function getOrCreateAgentSession(
  agentConfig: AgentSessionConfig,
  userEmail: string,
) {
  if (agentConfig?.composioSessionId) {
    return composio.sessions.use(agentConfig.composioSessionId);
  }

  if (!isStringArray(agentConfig.tools)) {
    throw new Error("Agent tools configuration must be a list of tool slugs.");
  }

  const session = await composio.sessions.create(userEmail, {
    toolkits: toComposioToolkits(agentConfig.tools),
  });

  await saveComposioSessionId(agentConfig.agentId, session.sessionId);

  return session;
}

const saveComposioSessionId = async (agentId: string, sessionId: string) => {
  await db
    .update(AgentConfig)
    .set({
      composioSessionId: sessionId,
    })
    .where(eq(AgentConfig.agentId, agentId));
};
