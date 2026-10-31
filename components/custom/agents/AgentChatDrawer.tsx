"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Paperclip, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CreatedAgentType } from "./CreateAgent";

type Props = {
  agent: CreatedAgentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChatMessage = {
  id: string;
  role: "user" | "agent" | "error";
  content: string;
};

function getAgentOutput(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "finaloutput" in data &&
    typeof data.finaloutput === "string" &&
    data.finaloutput.trim()
  ) {
    return data.finaloutput.trim();
  }

  throw new Error("The agent returned an empty or invalid response.");
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: unknown }>(error)) {
    const apiError = error.response?.data?.error;
    if (typeof apiError === "string") return apiError;
    if (error.code === "ERR_NETWORK") {
      return "Could not connect to the server. Check your connection and try again.";
    }
    return error.message || "The agent request failed. Please try again.";
  }

  return error instanceof Error
    ? error.message
    : "Could not reach the agent. Please try again.";
}

export default function AgentChatDrawer({ agent, open, onOpenChange }: Props) {
  const [prompt, setPrompt] = useState("");
  const [isAgentReplying, setIsAgentReplying] = useState(false);

  // Unique storage key per agent so chats don't overlap
  const storageKey = `chat_history_${agent.agentId}`;

  // Initialize messages from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history from localStorage", e);
    }
    return [];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history to localStorage", e);
    }
  }, [messages, storageKey]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isAgentReplying]);

  const sendMessage = async () => {
    const message = prompt.trim();
    if (!message || isAgentReplying) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsAgentReplying(true);

    try {
      const { data } = await axios.post<unknown>("/api/run", {
        agentId: agent.agentId,
        input: message,
      });
      const output = getAgentOutput(data);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: output,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "error",
          content: getErrorMessage(error),
        },
      ]);
    } finally {
      setIsAgentReplying(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b px-5 py-4 pr-14">
          <div className="flex items-center gap-3">
            <img
              src={agent.agentImage || "/placeholder-agent.png"}
              alt={agent.name || "Agent"}
              className="size-11 rounded-xl bg-slate-100 object-cover p-1"
            />

            <div className="min-w-0">
              <SheetTitle className="truncate text-base">
                {agent.name}
              </SheetTitle>

              <SheetDescription className="text-xs">
                Chat with your agent and give it a task.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-5">
          <div className="flex min-h-full flex-col justify-end gap-4">
            <div className="mx-auto mb-4 max-w-sm text-center">
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Sparkles className="size-5" />
              </div>

              <h2 className="text-sm font-medium">
                Start a chat with {agent.name}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {agent.objective || agent.description}
              </p>
            </div>

            <AgentMessage
              agent={agent}
              content={`Hi! I’m ${agent.name}. What would you like me to work on?`}
            />

            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <Bubble align="end" variant="default">
                    <BubbleContent>
                      <p className="whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    </BubbleContent>
                  </Bubble>
                </div>
              ) : message.role === "error" ? (
                <AgentMessage
                  key={message.id}
                  agent={agent}
                  content={message.content}
                  variant="destructive"
                />
              ) : (
                <AgentMessage
                  key={message.id}
                  agent={agent}
                  content={message.content}
                />
              ),
            )}

            {isAgentReplying && (
              <div className="flex items-end gap-2">
                <img
                  src={agent.agentImage || "/placeholder-agent.png"}
                  alt={agent.name || "Agent"}
                  className="size-8 rounded-full border bg-background object-cover p-1"
                />

                <Bubble align="start" variant="outline">
                  <BubbleContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm">
                        {agent.name} is thinking...
                      </span>
                    </div>
                  </BubbleContent>
                </Bubble>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 border-t bg-background p-4">
          <div className="rounded-2xl border p-2 shadow-sm focus-within:border-purple-400">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                isAgentReplying
                  ? `${agent.name} is replying...`
                  : `Message ${agent.name}...`
              }
              disabled={isAgentReplying}
              aria-label="Message your agent"
              className="max-h-40 min-h-16 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Attach a file"
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                onClick={sendMessage}
                disabled={!prompt.trim() || isAgentReplying}
                className="rounded-full bg-purple-600 text-white hover:bg-purple-700"
                aria-label="Send message"
              >
                {isAgentReplying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AgentMessage({
  agent,
  content,
  variant = "outline",
}: {
  agent: CreatedAgentType;
  content: string;
  variant?: "outline" | "destructive";
}) {
  return (
    <div className="flex min-w-0 items-end gap-2">
      <img
        src={agent.agentImage || "/placeholder-agent.png"}
        alt={agent.name || "Agent"}
        className="size-8 shrink-0 rounded-full border bg-background object-cover p-1"
      />

      {/* min-w-0 lets the bubble shrink inside the flex row so wide tables scroll instead of being clipped */}
      <Bubble align="start" variant={variant} className="min-w-0 max-w-[85%]">
        <BubbleContent className="min-w-0">
          <div className="prose prose-sm dark:prose-invert wrap-break-word max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <div className="my-2 w-full overflow-x-auto">
                    <table {...props} className="w-max min-w-full" />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th {...props} className="whitespace-nowrap px-3 py-2" />
                ),
                td: ({ node, ...props }) => (
                  <td {...props} className="min-w-28 px-3 py-2 align-top" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </BubbleContent>
      </Bubble>
    </div>
  );
}
