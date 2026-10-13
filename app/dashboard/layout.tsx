import { AppSidebar } from "@/components/custom/dashboard/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

function DashboardLayout({ children }: any) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />

      <div className="w-full" >{children}</div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
