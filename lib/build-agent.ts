import { AgentConfig } from "@/db";
import { getOrCreateAgentSession } from "./get-agent-comoposio-session";
import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  type Content,
  type Part,
} from "@google/genai";

const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_CLOUD_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY,
});

const MAX_TOOL_ROUNDS = 12;

// Gemini only accepts a subset of JSON Schema. Composio's schemas contain keys
// like "examples", "additionalProperties", "$ref", etc. that make the API return 400.
const ALLOWED_SCHEMA_KEYS = new Set([
  "type",
  "format",
  "title",
  "description",
  "nullable",
  "enum",
  "properties",
  "required",
  "items",
  "minItems",
  "maxItems",
  "minimum",
  "maximum",
  "minLength",
  "maxLength",
  "pattern",
  "anyOf",
  "default",
]);

function sanitizeSchema(schema: any): any {
  if (Array.isArray(schema)) return schema.map(sanitizeSchema);
  if (!schema || typeof schema !== "object") return schema;

  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (!ALLOWED_SCHEMA_KEYS.has(key)) continue;

    if (key === "properties" && value && typeof value === "object") {
      // keys here are property NAMES, not schema keywords: keep them all
      out.properties = Object.fromEntries(
        Object.entries(value as Record<string, any>).map(([k, v]) => [
          k,
          sanitizeSchema(v),
        ]),
      );
    } else if (key === "type" && Array.isArray(value)) {
      // ["string", "null"] -> type: "string", nullable: true
      const nonNull = value.filter((t) => t !== "null");
      out.type = nonNull[0] ?? "string";
      if (value.includes("null")) out.nullable = true;
    } else if (key === "items" || key === "anyOf") {
      out[key] = sanitizeSchema(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function sanitizeDeclarations(decls: any[]): any[] {
  return decls.map((d) => ({
    name: d.name,
    description: d.description,
    parameters: d.parameters ? sanitizeSchema(d.parameters) : undefined,
  }));
}

export async function buildAgent(
  agentConfig: typeof AgentConfig.$inferSelect,
  userEmail: string,
) {
  const session = await getOrCreateAgentSession(agentConfig, userEmail);

  // GoogleProvider returns an array of FunctionDeclarations (meta-tools such as
  // COMPOSIO_SEARCH_TOOLS, COMPOSIO_MULTI_EXECUTE_TOOL, COMPOSIO_MANAGE_CONNECTIONS).
  const functionDeclarations = sanitizeDeclarations(
    (await session.tools()) as unknown as any[],
  );

  const instructions = `
Agent Name: ${agentConfig.name}
Role: ${agentConfig.description}
Agent Instructions: ${agentConfig.instructions}
Primary Objectives: ${agentConfig.objective}
Skills: ${(Array.isArray(agentConfig.skills) ? agentConfig.skills : []).join(", ")}
Required Output Format: ${agentConfig.outputFormat}

TOOL USAGE RULES (mandatory):
- You are connected to the user's external apps (e.g. Gmail) through Composio meta-tools. You DO have access to them.
- Never say you lack access to the user's apps and never ask the user to paste data. Call the tools instead.
- Workflow for any external-app task:
  1. Call COMPOSIO_SEARCH_TOOLS with the task to discover the right tools (and a session_id).
  2. If the app is not connected, call COMPOSIO_MANAGE_CONNECTIONS and give the user the returned auth link.
  3. Call COMPOSIO_MULTI_EXECUTE_TOOL with the discovered tool slug(s) and arguments (reuse the session_id).
  4. Summarize or act on the real tool results.
- Do not claim an action succeeded unless the tool result confirms it.
- Ask for confirmation before destructive or high-risk actions.
`.trim();

  const modelName = process.env.GOOGLE_MODEL_NAME || "gemini-2.5-flash";

  return {
    name: agentConfig.name,
    model: modelName,
    instructions,

    async run(prompt: string) {
      const contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];

      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: instructions,
            // FIX: Gemini needs Tool objects wrapping the declarations.
            tools: [{ functionDeclarations }],
            toolConfig: {
              functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
            },
          },
        });

        const modelContent = response.candidates?.[0]?.content;
        const calls = response.functionCalls ?? [];

        if (!calls.length) return response.text;

        // Keep the model turn verbatim (preserves thought signatures).
        if (modelContent) contents.push(modelContent);

        // Execute every requested call, not just the first.
        const responseParts: Part[] = await Promise.all(
          calls.map(async (call) => {
            const name = call.name ?? "";
            console.log("🔧", name, call.args);
            try {
              const result = await session.execute(name, call.args ?? {});
              return {
                functionResponse: {
                  id: call.id,
                  name,
                  response: result.error
                    ? { error: result.error }
                    : { result: result.data },
                },
              };
            } catch (err: any) {
              console.error(`Tool ${name} failed:`, err);
              return {
                functionResponse: {
                  id: call.id,
                  name,
                  response: { error: err?.message ?? "Tool execution failed" },
                },
              };
            }
          }),
        );

        contents.push({ role: "user", parts: responseParts });
      }

      return "Stopped: reached the maximum number of tool-call rounds.";
    },
  };
}
