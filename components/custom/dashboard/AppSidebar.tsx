"use client";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { UserDetailContext } from "@/context/UserDetailContext";
import { UserButton } from "@clerk/nextjs";
import {
  AppWindow,
  Blocks,
  Bot,
  Layers,
  Play,
  Settings,
  User2,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useContext } from "react";

export function AppSidebar() {
  const path = usePathname();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2.5 flex-row px-4 py-4">
        <Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
        <h2 className="text-lg font-semibold text-slate-900">Kinetix AI</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenuButton
            className={`h-12 gap-3 hover:bg-slate-100 ${path.includes("/dashboard") ? "bg-slate-100 text-slate-900" : ""} `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-900 shrink-0 ">
              <AppWindow className="h-5 w-5 text-blue-900" />
            </div>
            <span className="">Dashboard</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={`h-12 gap-3 hover:bg-slate-100 ${path.includes("/dashboard/agents") ? "bg-slate-100 text-slate-900" : ""} `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-green-100 text-slate-900 shrink-0 ">
              <Bot className="h-5 w-5 text-green-900" />
            </div>
            <span className="">Agents</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={`h-12 gap-3 hover:bg-slate-100 ${path.includes("/dashboard/runs") ? "bg-slate-100 text-slate-900" : ""} `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-red-100 text-slate-900 shrink-0 ">
              <Play className="h-5 w-5 text-red-900" />
            </div>
            <span className="">Runs</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={`h-12 gap-3 hover:bg-slate-100 ${path.includes("/dashboard/integrations") ? "bg-slate-100 text-slate-900" : ""} `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-purple-100 text-slate-900 shrink-0 ">
              <Blocks className="h-5 w-5 text-purple-900" />
            </div>
            <span className="">Integrations</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={`h-12 gap-3 hover:bg-slate-100 ${path.includes("/dashboard/templates") ? "bg-slate-100 text-slate-900" : ""} `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-orange-100 text-slate-900 shrink-0 ">
              <Layers className="h-5 w-5 text-orange-900" />
            </div>
            <span className="">Templates</span>
          </SidebarMenuButton>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Users</SidebarGroupLabel>
          <SidebarMenuButton
            className={`h-12 gap-3 hover:bg-slate-100 ${path.includes("/dashboard/templates") ? "bg-slate-100 text-slate-900" : ""} `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-gray-100 text-slate-900 shrink-0 ">
              <Settings className="h-5 w-5 text-gray-900" />
            </div>
            <span className="">Settings</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={`h-12 gap-3 hover:bg-slate-100 ${path.includes("/dashboard/templates") ? "bg-slate-100 text-slate-900" : ""} `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-yellow-100 text-slate-900 shrink-0 ">
              <User2 className="h-5 w-5 text-yellow-900" />
            </div>
            <span className="">Profile</span>
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className=" p-2 rounded-lg border flex flex-col gap-2">
          <h2 className="flex justify-between items-center">
            Agents<span className="">{userDetail?.agentCredits || 0}/5</span>
          </h2>
          <h2 className="flex justify-between items-center">
            Credits<span className="">{userDetail?.usageCredits || 0}</span>
          </h2>
          <Progress value={60} className="h-2 w-full" />{" "}
        </div>
        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg border">
          <UserButton />
          <span>{userDetail?.name}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
