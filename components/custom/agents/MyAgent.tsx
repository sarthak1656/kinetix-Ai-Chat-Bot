"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  Ellipsis,
  Pause,
  Pencil,
  Play,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreatedAgentType, AgentSchedule } from "./CreateAgent";
import AgentEditSheet from "./AgentEditSheet";

function formatSchedule(schedule?: AgentSchedule | null) {
  if (!schedule || schedule.type === "manual") return "On demand";

  const time =
    schedule.time && schedule.time !== "immediate" ? schedule.time : null;

  if (schedule.type === "recurring") {
    const frequencyLabel =
      schedule.frequency === "hourly"
        ? "Hourly"
        : schedule.frequency === "weekly"
          ? "Weekly"
          : schedule.frequency === "monthly"
            ? "Monthly"
            : "Daily";
    return time ? `${frequencyLabel} at ${time}` : frequencyLabel;
  }

  if (schedule.type === "once") {
    return time ? `Once at ${time}` : "Once";
  }

  return "On demand";
}

function MyAgent() {
  const [agents, setAgents] = useState<CreatedAgentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<CreatedAgentType | null>(
    null,
  );

  const fetchAgents = async () => {
    try {
      const result = await axios.get("/api/agents/configure");
      setAgents(result.data || []);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            My Agents
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Run, manage, and update all the agents you've created.
          </p>
        </div>
        <p className="text-sm text-muted-foreground shrink-0">
          {agents.length} {agents.length === 1 ? "agent" : "agents"}
        </p>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 rounded-2xl border bg-white animate-pulse"
            />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-white p-12 text-center">
          <h3 className="font-semibold text-slate-900">No agents yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an agent and it will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {agent.agentImage ? (
                    <img
                      src={agent.agentImage}
                      alt={agent.name || "Agent"}
                      className="size-11 rounded-full bg-slate-100 object-cover shrink-0"
                    />
                  ) : (
                    <div className="size-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold shrink-0">
                      {agent.name?.charAt(0) || "A"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {agent.name || "Unnamed Agent"}
                      </h3>
                      <span className="text-xs font-medium text-emerald-600 capitalize">
                        {agent.status || "active"}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-700"
                    >
                      <Ellipsis className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer text-xs">
                        <Play className="w-3.5 h-3.5 mr-2" /> Run Now
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-xs">
                        <Pause className="w-3.5 h-3.5 mr-2" /> Pause Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTimeout(() => setEditingAgent(agent), 50);
                        }}
                        className="cursor-pointer text-xs"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Agent
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer text-xs text-red-600 focus:text-red-600 group">
                        <Trash className="w-3.5 h-3.5 mr-2 text-red-600 group-hover:text-red-600" />{" "}
                        Delete Agent
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="mt-3 text-sm text-muted-foreground line-clamp-2 min-h-10">
                {agent.description ||
                  agent.objective ||
                  "No description provided."}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-slate-400" />
                <span>{formatSchedule(agent.schedule)}</span>
              </div>

              <Button className="mt-5 w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium">
                <Play className="size-4 fill-current" />
                Run agent
              </Button>
            </div>
          ))}
        </div>
      )}

      <AgentEditSheet
        agentConfig={editingAgent}
        open={!!editingAgent}
        onOpenChange={(open) => {
          if (!open) setEditingAgent(null);
        }}
        onSave={(updated) => {
          setAgents((prev) =>
            prev.map((item) =>
              item.agentId === updated.agentId ? updated : item,
            ),
          );
          setEditingAgent(updated);
        }}
      />
    </div>
  );
}

export default MyAgent;
