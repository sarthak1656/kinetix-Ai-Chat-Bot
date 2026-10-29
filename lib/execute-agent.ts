import { AgentConfig } from "@/db";
import { buildAgent } from "./build-agent";

export async function executeAgent(
  agentConfig: typeof AgentConfig.$inferSelect,
  userEmail: string,
  input: string,
) {
  if (agentConfig.status?.toLowerCase() !== "active") {
    throw new Error("Agent is not active");
  }

  // Build the agent object (which now contains the Gemini run method)
  const agent = await buildAgent(agentConfig, userEmail);

  // Use the input string or fall back to the agent's objective
  const promptInput = input.trim() || agentConfig.objective || "";

  // Call the built-in .run() method we defined in buildAgent using @google/genai
  const resultText = await agent.run(promptInput);

  return {
    finaloutput: resultText,
  };
}
