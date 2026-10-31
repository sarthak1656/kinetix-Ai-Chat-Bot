import Browserbase from "@browserbasehq/sdk";
import { Type, type FunctionDeclaration } from "@google/genai";

export type LocalTool = {
  declaration: FunctionDeclaration;
  execute: (args: Record<string, any>) => Promise<Record<string, unknown>>;
};

const TERMINAL_STATUSES = ["COMPLETED", "FAILED", "STOPPED", "TIMED_OUT"];
const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 4 * 60 * 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function researchWithBrowserbase(task: string) {
  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

  const { runId } = await bb.agents.runs.create({
    agentId: process.env.BROWSERBASE_AGENT_ID!,
    task, // use the task Gemini provides (the original hardcoded a string)
    browserSettings: { proxies: true },
  });

  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    const run = await bb.agents.runs.retrieve(runId);
    if (TERMINAL_STATUSES.includes(run.status)) {
      return { runId, status: run.status, result: run.result };
    }
    await sleep(POLL_INTERVAL_MS); // wait while the run is still in progress
  }

  throw new Error("Browser run timed out");
}

export const browserbaseResearchTool: LocalTool = {
  declaration: {
    name: "browser_research",
    description:
      "Browse or search the live internet: compare current product prices, check current availability, or verify information on websites. Read-only browser tool.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        task: {
          type: Type.STRING,
          description: "The complete live web research task to perform",
        },
      },
      required: ["task"],
    },
  },

  async execute(args) {
    const task = String(args.task ?? "");
    if (task.length < 10) {
      return { status: "ERROR", error: "task must be at least 10 characters" };
    }
    try {
      return await researchWithBrowserbase(task);
    } catch (error: any) {
      return { status: "ERROR", error: error?.message ?? String(error) };
    }
  },
};
