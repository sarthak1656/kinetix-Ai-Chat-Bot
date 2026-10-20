import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateAgent from "@/components/custom/agents/CreateAgent";
import MyAgent from "../../../components/custom/agents/MyAgent";
function AgentsPage() {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-6 pt-18 pb-16">
        <Tabs defaultValue="create-agent" className="w-full">
          <TabsList>
            <TabsTrigger value="create-agent">Create Agent</TabsTrigger>
            <TabsTrigger value="my-agent">My Agents</TabsTrigger>
          </TabsList>
          <TabsContent value="create-agent">
            <div className="max-w-3xl">
              <CreateAgent />
            </div>
          </TabsContent>
          <TabsContent value="my-agent">
            <MyAgent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AgentsPage;
