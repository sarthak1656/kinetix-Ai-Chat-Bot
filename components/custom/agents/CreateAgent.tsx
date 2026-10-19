"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  ArrowUp,
  Plus,
  BriefcaseBusiness,
  Mail,
  Search,
  CalendarDays,
  TrendingUp,
  Sparkles,
  Loader2,
  Loader2Icon,
} from "lucide-react";
import React, { useState } from "react";
import AIAgentQuestions from "./AIAgentQuestions";
import NewAgentCard from "./NewAgentCard";
import { set } from "date-fns";

const quickSuggestions = [
  {
    label: "Draft Professional Email",
    prompt:
      "Draft a polite and professional follow-up email to a recruiter regarding a recent software developer interview.",
  },
  {
    label: "Explain Complex Topic",
    prompt:
      "Explain how quantum computing works in simple terms using everyday analogies that anyone can understand.",
  },
  {
    label: "Plan a Weekend Trip",
    prompt:
      "Create a detailed 2-day travel itinerary for a weekend getaway, including top local food spots, historical landmarks, and hidden gems.",
  },
  {
    label: "Creative Story Idea",
    prompt:
      "Write a short sci-fi opening scene about a lone astronaut discovering an unexpected signal on a distant moon.",
  },
  {
    label: "Healthy Meal Prep",
    prompt:
      "Suggest a healthy, quick, high-protein weekly meal prep plan with a complete grocery shopping list.",
  },
  {
    label: "Brainstorm Project Ideas",
    prompt:
      "Brainstorm 5 innovative, practical SaaS project ideas combining modern web tech and AI agents for indie hackers.",
  },
];

export const templates = [
  {
    title: "Find latest jobs",
    description:
      "Search the web for the latest jobs matching my profile and tech stack.",
    icon: BriefcaseBusiness,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    border: "hover:border-orange-300",
    glow: "hover:shadow-orange-100",
  },
  {
    title: "Daily inbox summary",
    description:
      "Summarize important emails and highlight what needs my immediate attention.",
    icon: Mail,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "hover:border-blue-300",
    glow: "hover:shadow-blue-100",
  },
  {
    title: "Research a topic",
    description:
      "Search the web and create a comprehensive research summary for me.",
    icon: Search,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    border: "hover:border-purple-300",
    glow: "hover:shadow-purple-100",
  },
  {
    title: "Plan My Day",
    description:
      "Organize my daily schedule, tasks, and priorities for maximum productivity.",
    icon: CalendarDays,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "hover:border-emerald-300",
    glow: "hover:shadow-emerald-100",
  },
  {
    title: "Market Trends",
    description:
      "Analyze the latest industry trends, tech news, and competitor updates.",
    icon: TrendingUp,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    border: "hover:border-rose-300",
    glow: "hover:shadow-rose-100",
  },
  {
    title: "Creative Brainstorm",
    description:
      "Generate innovative ideas, content outlines, or project concepts.",
    icon: Sparkles,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    border: "hover:border-amber-300",
    glow: "hover:shadow-amber-100",
  },
];

type AgentConfigResp = {
  status: "needs_clarification" | "ready";
  clarificationQuestions: ClarificationQuestion[];
  config: any;
};

export type ClarificationQuestion = {
  id: string;
  question: string;
  type: "single_select" | "multi_select" | "text" | "number" | "date" | "time";
  options: string[];
  allowCustom: boolean;
  customPlaceholder: string;
};

export type AgentSchedule = {
  type: "once" | "recurring" | "manual";
  frequency?: "hourly" | "daily" | "weekly" | "monthly";
  time?: string;
};

export type CreatedAgentType = {
  id: number;
  userEmail: string;
  agentId: string;
  name: string;
  agentImage: string;
  description: string;
  instructions: string;
  objective: string;
  model: string;
  tools: any;
  skills: string[];
  schedule: AgentSchedule;
  outputFormat: string;
  status: string; // Active, Pause
  createdAt: string;
};

function CreateAgent() {
  const [prompt, setPrompt] = useState("");
  const [configResult, setConfigResult] = useState<AgentConfigResp | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<CreatedAgentType | null>(
    null,
  );

const onSubmit = async () => {
  setLoading(true);
  try {
    const result = await axios.post("/api/agents/configure", {
      prompt: prompt,
    });
    console.log("Result: ", result.data);
    setConfigResult(result.data);
    if (result.data.status === "ready") {
      setCreatedAgent(result.data.config); // <-- Fix: pass result.data.config here
    }
  } catch (error) {
    console.error("Error configuring agent:", error);
  } finally {
    setLoading(false);
  }
};

const handleAnswersSubmit = async (
  answers: Record<string, string | string[]>,
) => {
  console.log("User submitted clarification answers:", answers);
  setConfigResult(null); 
  const updatedPrompt = prompt + "\n" + JSON.stringify(answers);
  setLoading(true);
  try {
    const result = await axios.post("/api/agents/configure", {
      prompt: updatedPrompt,
    });
    console.log("Result: ", result.data);
    setConfigResult(result.data);
    if (result.data.status === "ready") {
      setCreatedAgent(result.data.config); // <-- Fix: pass result.data.config here as well
    }
  } catch (error) {
    console.error("Error configuring agent:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mt-5">
      <div className="">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create New Agent
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask what type of agent you want to create, Type your goal, task or
          workflow
        </p>

        <div className="w-full border rounded-2xl bg-background p-3 mt-3 shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all duration-300">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-22.5 w-full resize-none bg-transparent px-2 py-3 text-sm outline-none"
            placeholder="Describe the agent you want to create..."
          />
          <div className="flex justify-between items-center">
            <div className="">
              <Button variant={"ghost"} size={"icon"}>
                <Plus />
              </Button>
            </div>
            <Button
              size={"icon"}
              className={
                "h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
              }
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickSuggestions.map((suggestion, index) => (
          <Button
            onClick={() => setPrompt(suggestion.prompt)}
            key={index}
            variant={"outline"}
            size="sm"
          >
            {suggestion.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex gap-2 items-center p-3 border rounded-2xl bg-background mt-7 shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all duration-300">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <h2 className="">Generating response...</h2>
        </div>
      ) : (
        !configResult && (
          <div className="mt-10">
            <h2 className="flex text-lg justify-between items-center font-semibold">
              Get Started <span className="text-sm font-medium">view all</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {templates.map((template, index) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={index}
                    className={`p-5 rounded-2xl border bg-background transition-all duration-300 cursor-pointer shadow-sm ${template.border} ${template.glow}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${template.iconBg} mb-3`}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${template.iconColor}`}
                      />
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {template.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {configResult && (
        <div className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            Agent Configuration
          </h2>
          {configResult.status === "needs_clarification" ? (
            <AIAgentQuestions
              questionList={configResult.clarificationQuestions}
              onAnswersSubmit={handleAnswersSubmit}
            />
          ) : (
            <div className="mt-4 p-5 rounded-2xl border bg-background shadow-lg shadow-purple-100">
              {/* <h3 className="text-lg font-semibold text-purple-700">
          Agent Ready: {(configResult as any).name || (configResult as any).config?.name || (Array.isArray(configResult) && configResult[0]?.name)}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {(configResult as any).description || (configResult as any).config?.description || (Array.isArray(configResult) && configResult[0]?.description)}
        </p> */}
              <NewAgentCard createdAgent={createdAgent} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateAgent;
