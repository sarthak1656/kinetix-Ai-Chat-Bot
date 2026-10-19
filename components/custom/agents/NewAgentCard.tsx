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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  createdAgent: CreatedAgentType | null;
};

function NewAgentCard({ createdAgent }: Props) {
  if (!createdAgent) return null;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
      {/* Left Section: Avatar + Details */}
      <div className="flex items-start md:items-center gap-4">
        {createdAgent?.agentImage ? (
          <img
            src={createdAgent.agentImage}
            alt={createdAgent.name || "Agent Avatar"}
            width={56}
            height={56}
            className="rounded-2xl p-2 bg-slate-100 border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
            {createdAgent?.name?.charAt(0) || "A"}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-900 text-base">
              {createdAgent?.name || "Unnamed Agent"}
            </h2>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 capitalize">
              {createdAgent?.status || "active"}
            </span>
          </div>

          <p className="text-sm text-slate-500 line-clamp-2">
            {createdAgent?.description || "No description provided."}
          </p>

          {/* Model & Tools Badges */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {createdAgent?.model && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                <Cpu className="w-3 h-3 text-slate-500" />
                {createdAgent.model}
              </span>
            )}
            {Array.isArray(createdAgent?.tools) &&
              createdAgent.tools.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  <Wrench className="w-3 h-3 text-purple-500" />
                  {createdAgent.tools.join(", ")}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Right Section: Schedule Meta */}
      <div className="flex flex-col md:items-end gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 text-slate-500 text-xs shrink-0">
        {createdAgent?.schedule?.time && (
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <CalendarCheck2Icon
              className="text-purple-600 shrink-0"
              size={16}
            />
            <span>
              Next run:{" "}
              <strong className="text-slate-800 capitalize">
                {createdAgent.schedule.time}
              </strong>
            </span>
          </div>
        )}

        {createdAgent?.schedule?.type && (
          <div className="text-slate-500">
            Runs:{" "}
            <span className="font-medium text-slate-700 capitalize">
              {createdAgent.schedule.frequency || createdAgent.schedule.type}
            </span>
          </div>
        )}
      </div>

    <div className="flex gap-2 items-center text-muted-foreground">
        <Button variant="ghost" size={"icon"}>
          <Pencil />
        </Button>

       <DropdownMenu>
  <DropdownMenuTrigger>
    {/* Div wrapper prevents nested <button> HTML violations */}
    <div>
      <Button variant="ghost" size={"icon"}>
        <Ellipsis />
      </Button>
    </div>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <Play /> Run Now
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Pause /> Pause Agent
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Pencil /> Edit Agent
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem variant={"destructive"}> 
        <Trash  /> Delete Agent 
      </DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
      </div>
    </div>
  );
}

export default NewAgentCard;
