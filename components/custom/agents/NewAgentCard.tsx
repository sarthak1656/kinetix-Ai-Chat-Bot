"use client";

import React, { useState } from "react";
import { CreatedAgentType } from "./CreateAgent";
import {
  CalendarCheck2Icon,
  Cpu,
  Ellipsis,
  Pause,
  Pencil,
  Play,
  Trash,
  Wrench,
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
import AgentEditSheet from "./AgentEditSheet";

type Props = {
  createdAgent: CreatedAgentType | null;
  onAgentUpdated?: (updatedAgent: CreatedAgentType) => void;
  onAgentDeleted?: (id: number) => void;
};

function NewAgentCard({ createdAgent, onAgentUpdated, onAgentDeleted }: Props) {
  const [agent, setAgent] = useState<CreatedAgentType | null>(createdAgent);
  const [editOpen, setEditOpen] = useState(false);

  if (!agent) return null;

  const handleSave = (updatedAgent: CreatedAgentType) => {
    setAgent(updatedAgent);
    if (onAgentUpdated) {
      onAgentUpdated(updatedAgent);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 w-full overflow-hidden">
      {/* Left Section: Avatar + Details */}
      <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
        {agent?.agentImage ? (
          <img
            src={agent.agentImage}
            alt={agent.name || "Agent Avatar"}
            width={56}
            height={56}
            className="w-14 h-14 rounded-2xl p-2 bg-slate-100 border border-slate-200 shrink-0 object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
            {agent?.name?.charAt(0) || "A"}
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-900 text-base truncate max-w-full">
              {agent?.name || "Unnamed Agent"}
            </h2>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 capitalize shrink-0">
              {agent?.status || "active"}
            </span>
          </div>

          <p className="text-sm text-slate-500 line-clamp-2 wrap-break-word">
            {agent?.description ||
              agent?.objective ||
              "No description provided."}
          </p>

          {/* Model & Tools Badges */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {agent?.model && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                <Cpu className="w-3 h-3 text-slate-500 shrink-0" />
                {agent.model}
              </span>
            )}
            {Array.isArray(agent?.tools) && agent.tools.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md max-w-full truncate">
                <Wrench className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="truncate">{agent.tools.join(", ")}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Schedule Meta & Action Buttons */}
      <div className="flex flex-col sm:flex-row md:items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
        <div className="flex flex-col md:items-end gap-1.5 text-slate-500 text-xs shrink-0">
          {agent?.schedule?.time && (
            <div className="flex items-center gap-1.5 font-medium text-slate-600">
              <CalendarCheck2Icon
                className="text-purple-600 shrink-0"
                size={16}
              />
              <span>
                Next run:{" "}
                <strong className="text-slate-800 capitalize">
                  {agent.schedule.time}
                </strong>
              </span>
            </div>
          )}

          {agent?.schedule?.type && (
            <div className="text-slate-500">
              Runs:{" "}
              <span className="font-medium text-slate-700 capitalize">
                {agent.schedule.frequency || agent.schedule.type}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-1 items-center text-muted-foreground shrink-0 self-end md:self-center">
          <AgentEditSheet
            agentConfig={agent}
            onSave={handleSave}
            open={editOpen}
            onOpenChange={setEditOpen}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:text-slate-900"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </AgentEditSheet>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-600 hover:text-slate-900"
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
                    setTimeout(() => setEditOpen(true), 50);
                  }}
                  className="cursor-pointer text-xs"
                >
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Agent
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => onAgentDeleted && onAgentDeleted(agent.id)}
                  className="cursor-pointer text-xs text-red-600 focus:text-red-600 group"
                >
                  <Trash className="w-3.5 h-3.5 mr-2 text-red-600 group-hover:text-red-600" />{" "}
                  Delete Agent
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default NewAgentCard;
