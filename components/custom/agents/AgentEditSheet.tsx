"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CreatedAgentType } from "./CreateAgent";
import { Shuffle, Plus, X, Link2, Unlink, Info, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "@/components/ui/toast";

type Props = {
  children: React.ReactElement;
  agentConfig: CreatedAgentType | null;
  onSave?: (updatedAgent: CreatedAgentType) => void;
};

const AVAILABLE_TOOLS = [
  {
    id: "google_calendar",
    name: "google_calendar",
    description: "Google Calendar integration",
  },
  { id: "notion", name: "notion", description: "Notion database integration" },
];

export default function AgentEditSheet({
  children,
  agentConfig,
  onSave,
}: Props) {
  const [draftAgent, setDraftAgent] = useState<CreatedAgentType | null>(
    agentConfig,
  );
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraftAgent(agentConfig);
  }, [agentConfig]);

  const updateDraft = (key: string, value: any) => {
    setDraftAgent((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSchedule = (key: string, value: any) => {
    setDraftAgent((prev: any) => ({
      ...prev,
      schedule: {
        ...prev?.schedule,
        [key]: value,
      },
    }));
  };

  const shuffleImage = () => {
    const randomSeed = crypto.randomUUID();
    const newImage =
      "https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=" +
      randomSeed;
    updateDraft("agentImage", newImage);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const currentSkills = draftAgent?.skills || [];
    if (!currentSkills.includes(newSkill.trim())) {
      updateDraft("skills", [...currentSkills, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = draftAgent?.skills || [];
    updateDraft(
      "skills",
      currentSkills.filter((s) => s !== skillToRemove),
    );
  };

  const toggleTool = (toolName: string) => {
    const currentTools: string[] = Array.isArray(draftAgent?.tools)
      ? draftAgent.tools
      : [];
    if (currentTools.includes(toolName)) {
      updateDraft(
        "tools",
        currentTools.filter((t) => t !== toolName),
      );
    } else {
      updateDraft("tools", [...currentTools, toolName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftAgent) return;

    setLoading(true);
    try {
      // API request to update agent in database
      const response = await axios.put("/api/agents/configure", draftAgent);
      const updatedData = response.data?.agent || draftAgent;

      if (onSave) {
        onSave(updatedData);
      }

      toast.add({
        type: "success",
        title: "Success",
        description: "Agent changes saved successfully!",
      });

      setOpen(false); // Close sheet after saving successfully
    } catch (error: any) {
      console.error("Error saving agent changes:", error);

      toast.add({
        type: "error",
        title: "Error",
        description:
          error?.response?.data?.error ||
          "Failed to save agent changes. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectedToolsCount = Array.isArray(draftAgent?.tools)
    ? draftAgent.tools.length
    : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>{children}</SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-screen max-h-screen bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
          {/* Header (Fixed) */}
          <SheetHeader className="p-5 border-b shrink-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Image src="/logo.svg" alt="logo" width={28} height={28} />
              </div>
              <div className="text-left">
                <SheetTitle className="text-lg font-bold">
                  Edit Agent
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Update how this agent looks, works, and runs.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Area */}
          <ScrollArea className="flex-1 w-full overflow-y-auto">
            <div className="p-5 space-y-5 pb-10">
              {/* Agent Image */}
              <section className="flex items-center gap-4 border rounded-2xl bg-slate-50/50 p-4">
                <img
                  src={draftAgent?.agentImage ?? ""}
                  alt={draftAgent?.name ?? "Agent"}
                  width={72}
                  height={72}
                  className="bg-slate-100 p-2 border rounded-2xl size-18 shrink-0 object-cover"
                />
                <div className="space-y-1.5">
                  <p className="font-semibold text-sm">Agent Image</p>
                  <p className="text-xs text-muted-foreground">
                    Shuffle to generate a new look
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={shuffleImage}
                    className="gap-2 text-xs font-medium border-slate-300"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Shuffle Image
                  </Button>
                </div>
              </section>

              {/* Agent Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Agent Name
                </label>
                <Input
                  value={draftAgent?.name || ""}
                  onChange={(e) => updateDraft("name", e.target.value)}
                  placeholder="Give your agent a name"
                  required
                />
              </div>

              {/* Objective */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Objective
                </label>
                <Textarea
                  value={draftAgent?.objective || ""}
                  onChange={(e) => updateDraft("objective", e.target.value)}
                  placeholder="Describe the agent's primary goal..."
                  className="min-h-20 resize-none text-xs leading-relaxed"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Instructions
                </label>
                <Textarea
                  value={draftAgent?.instructions || ""}
                  onChange={(e) => updateDraft("instructions", e.target.value)}
                  placeholder="List step-by-step agent execution instructions..."
                  className="min-h-32 text-xs leading-relaxed"
                />
              </div>

              {/* Schedule Card */}
              <div className="border rounded-2xl p-4 space-y-3 bg-white">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800">
                    Schedule
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Choose when and how often this agent runs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">
                      Run type
                    </label>
                    <Select
                      value={draftAgent?.schedule?.type || "manual"}
                      onValueChange={(val) => updateSchedule("type", val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">manual</SelectItem>
                        <SelectItem value="once">once</SelectItem>
                        <SelectItem value="recurring">recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">
                      Time
                    </label>
                    <Input
                      type="time"
                      disabled={draftAgent?.schedule?.type === "manual"}
                      value={draftAgent?.schedule?.time || "08:58"}
                      onChange={(e) => updateSchedule("time", e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">
                    Frequency
                  </label>
                  <Select
                    disabled={draftAgent?.schedule?.type !== "recurring"}
                    value={draftAgent?.schedule?.frequency || "daily"}
                    onValueChange={(val) => updateSchedule("frequency", val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">hourly</SelectItem>
                      <SelectItem value="daily">daily</SelectItem>
                      <SelectItem value="weekly">weekly</SelectItem>
                      <SelectItem value="monthly">monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800">
                      Skills
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Add or remove capabilities this agent should use.
                    </p>
                  </div>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </div>

                <div className="border rounded-2xl p-3 bg-slate-50/50 min-h-16 flex flex-wrap gap-2 items-center">
                  {draftAgent?.skills && draftAgent.skills.length > 0 ? (
                    draftAgent.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border rounded-full text-xs font-medium text-slate-700 shadow-2xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No skills added yet.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="h-9 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSkill}
                    className="h-9 text-xs font-medium gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>

              {/* Connected Tools */}
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800">
                    Connected Tools
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {connectedToolsCount} of {AVAILABLE_TOOLS.length} connected
                  </p>
                </div>

                <div className="space-y-2.5">
                  {AVAILABLE_TOOLS.map((tool) => {
                    const isConnected = Array.isArray(draftAgent?.tools)
                      ? draftAgent.tools.includes(tool.name)
                      : false;

                    return (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-3 border rounded-2xl bg-white shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl border ${
                              isConnected
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                          >
                            {isConnected ? (
                              <Link2 className="w-4 h-4" />
                            ) : (
                              <Unlink className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-800">
                              {tool.name}
                            </p>
                            <p
                              className={`text-[11px] font-medium ${
                                isConnected
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {isConnected ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant={isConnected ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleTool(tool.name)}
                          className={`h-8 text-xs font-semibold px-4 ${
                            !isConnected
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : ""
                          }`}
                        >
                          {isConnected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Output Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Output Format
                </label>
                <Textarea
                  value={draftAgent?.outputFormat || ""}
                  onChange={(e) => updateDraft("outputFormat", e.target.value)}
                  placeholder="Specify the expected output structure..."
                  className="min-h-20 text-xs leading-relaxed"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions (Fixed) */}
          <SheetFooter className="p-4 border-t bg-white shrink-0 z-10">
            <div className="flex justify-end items-center gap-2.5 w-full">
              <SheetClose>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
