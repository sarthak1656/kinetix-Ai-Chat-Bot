import { AgentConfig, db } from "@/db";
import { composio } from "@/lib/composio";
import { eq } from "drizzle-orm";

type AgentSessionConfig = Pick<
  typeof AgentConfig.$inferSelect,
  "agentId" | "composioSessionId" | "tools"
>;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
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
    toolkits: agentConfig.tools,
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
