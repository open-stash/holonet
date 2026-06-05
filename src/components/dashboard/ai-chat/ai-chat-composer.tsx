"use client";

import { useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AiChatAttachMenu } from "./ai-chat-attach-menu";
import { AiChatModelMenu } from "./ai-chat-model-menu";
import { AiChatSearchModeMenu } from "./ai-chat-search-mode-menu";
import type { ModelId } from "./ai-chat-config";

interface AiChatComposerProps {
  className?: string;
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
}

export function AiChatComposer({
  className,
  onSend,
  onStop,
  isStreaming = false,
}: AiChatComposerProps) {
  const [message, setMessage] = useState("");
  const [modelId, setModelId] = useState<ModelId>("gpt-5.4");

  const canSend = message.trim().length > 0 && !isStreaming;

  function submit() {
    const text = message.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setMessage("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white",
        className
      )}
    >
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your stash…"
        rows={3}
        disabled={isStreaming}
        className="min-h-[80px] resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0 disabled:opacity-60"
      />

      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <AiChatAttachMenu />
          <AiChatSearchModeMenu />
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <AiChatModelMenu modelId={modelId} onModelChange={setModelId} />
          {isStreaming ? (
            <Button
              type="button"
              size="icon-sm"
              onClick={onStop}
              className="size-9 shrink-0 rounded-full border border-slate-200 bg-foreground text-white hover:bg-foreground/90"
              aria-label="Stop"
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon-sm"
              disabled={!canSend}
              onClick={submit}
              className={cn(
                "size-9 shrink-0 rounded-full disabled:opacity-100",
                canSend
                  ? "border border-slate-200 bg-white text-foreground hover:bg-slate-50"
                  : "border border-[#e7e7e9] bg-[#FAFAFA] text-[#a3a3a3] hover:bg-[#FAFAFA]"
              )}
              aria-label="Send"
            >
              <ArrowUp className="size-4 stroke-[2.5]" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
