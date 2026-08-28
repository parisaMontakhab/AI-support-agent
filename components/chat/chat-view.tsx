"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import {
  ChatMessage,
  ChatMessageSkeleton,
  type ChatMessageItem,
} from "@/components/chat/chat-message";

const WELCOME_MESSAGE: ChatMessageItem = {
  id: "welcome",
  role: "assistant",
  content: "Hi! 👋 How can I help you today?",
};

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([WELCOME_MESSAGE]);
  const [isPending, setIsPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const isPendingRef = useRef(false);
  const interactionIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  async function addMessage(content: string) {
    if (isPendingRef.current) return;

    isPendingRef.current = true;
    setIsPending(true);
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
        body: JSON.stringify({
          message: content,
          ...(interactionIdRef.current
            ? { previousInteractionId: interactionIdRef.current }
            : {}),
          ...(conversationIdRef.current
            ? { conversationId: conversationIdRef.current }
            : {}),
        }),
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

      const nextInteractionId =
        typeof data === "object" &&
        data !== null &&
        "interactionId" in data &&
        typeof data.interactionId === "string" &&
        data.interactionId.trim()
          ? data.interactionId
          : null;

      const nextConversationId =
        typeof data === "object" &&
        data !== null &&
        "conversationId" in data &&
        typeof data.conversationId === "string" &&
        data.conversationId.trim()
          ? data.conversationId
          : null;

      if (nextInteractionId) {
        interactionIdRef.current = nextInteractionId;
      }

      if (nextConversationId) {
        conversationIdRef.current = nextConversationId;
      }

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
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  }

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, isPending]);

  return (
    <div className="flex min-h-dvh justify-center bg-[#F7F4FA]">
      <div className="flex h-dvh w-full min-w-0 max-w-lg flex-col bg-white md:my-6 md:h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-3xl md:border md:border-[#E6DDEC] md:shadow-[0_6px_24px_rgba(91,61,143,0.06)]">
        <ChatHeader />

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4"
          aria-busy={isPending}
        >
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            {isPending ? <ChatMessageSkeleton /> : null}
          </div>
        </div>

        <ChatInput onSend={addMessage} disabled={isPending} />
      </div>
    </div>
  );
}
