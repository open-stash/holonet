"use client";

import { useEffect, useRef } from "react";
import { AiChatMessage } from "./ai-chat-message";
import type { ChatMessage } from "./ai-chat-types";

interface AiChatMessagesProps {
  messages: ChatMessage[];
  isReplying: boolean;
}

export function AiChatMessages({ messages, isReplying }: AiChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      {messages.map((message, i) => (
        <AiChatMessage
          key={message.id}
          message={message}
          isLast={i === messages.length - 1}
        />
      ))}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
