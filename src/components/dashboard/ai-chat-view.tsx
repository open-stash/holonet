"use client";

import { useState } from "react";
import { AiChatComposer } from "@/components/dashboard/ai-chat/ai-chat-composer";
import { AiChatMessages } from "@/components/dashboard/ai-chat/ai-chat-messages";
import { getChatGreetingLines } from "@/lib/chat-greeting";
import { useChatStore, useSettingsStore } from "@source/stores";

export function AiChatView() {
  const displayName = useSettingsStore((state) => state.displayName);
  const [greetingLines] = useState(() => getChatGreetingLines(displayName));

  const messages = useChatStore((state) => state.messages);
  const isReplying = useChatStore((state) => state.isReplying);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const stopGeneration = useChatStore((state) => state.stopGeneration);

  const hasMessages = messages.length > 0;

  if (!hasMessages) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 p-6">
        <p className="min-h-8 max-w-2xl text-center text-2xl font-semibold tracking-tight text-balance text-muted-foreground">
          {greetingLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
        <AiChatComposer className="w-full max-w-xl" onSend={sendMessage} />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <AiChatMessages messages={messages} isReplying={isReplying} />
      <div className="shrink-0 bg-white/80 px-6 py-4 backdrop-blur">
        <AiChatComposer
          className="mx-auto w-full max-w-xl"
          onSend={sendMessage}
          onStop={stopGeneration}
          isStreaming={isReplying}
        />
      </div>
    </main>
  );
}
