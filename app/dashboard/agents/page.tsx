import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateAgent from "@/components/custom/agents/CreateAgent";
import MyAgent from "../../../components/custom/agents/MyAgent";

type AgentsPageProps = {
  searchParams: Promise<{ connectAgentId?: string; tab?: string }>;
};

async function AgentsPage({ searchParams }: AgentsPageProps) {
  const { connectAgentId, tab } = await searchParams;
  const defaultTab =
    tab === "my-agent" || connectAgentId ? "my-agent" : "create-agent";

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-6 pt-18 pb-16">
        <Tabs defaultValue={defaultTab} className="w-full">
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
            <MyAgent connectAgentId={connectAgentId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AgentsPage;
