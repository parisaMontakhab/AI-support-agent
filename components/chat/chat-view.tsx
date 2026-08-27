"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import {
  ChatMessage,
  type ChatMessageItem,
} from "@/components/chat/chat-message";

const WELCOME_MESSAGE: ChatMessageItem = {
  id: "welcome",
  role: "assistant",
  content: "Hi! 👋 How can I help you today?",
};

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([WELCOME_MESSAGE]);
  const listRef = useRef<HTMLDivElement>(null);

  async function addMessage(content: string) {
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content,
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      const data: unknown = await response.json();
      const reply =
        typeof data === "object" &&
        data !== null &&
        "reply" in data &&
        typeof data.reply === "string" &&
        data.reply.trim()
          ? data.reply
          : "Sorry, I could not generate a reply.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I could not generate a reply.",
        },
      ]);
    }
  }

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages]);

  return (
    <div className="flex min-h-dvh justify-center bg-[#F7F4FA]">
      <div className="flex h-dvh w-full min-w-0 max-w-lg flex-col bg-white md:my-6 md:h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-3xl md:border md:border-[#E6DDEC] md:shadow-[0_6px_24px_rgba(91,61,143,0.06)]">
        <ChatHeader />

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4"
        >
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
          </div>
        </div>

        <ChatInput onSend={addMessage} />
      </div>
    </div>
  );
}
