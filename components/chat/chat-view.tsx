"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import {
  ChatMessage,
  ChatMessageSkeleton,
  type ChatMessageItem,
} from "@/components/chat/chat-message";
import {
  clearSavedConversationId,
  getSavedConversationId,
  saveConversationId,
} from "@/lib/chat/conversation-storage";

const WELCOME_MESSAGE: ChatMessageItem = {
  id: "welcome",
  role: "assistant",
  content: "Hi! 👋 How can I help you today?",
};

function parseRestoredConversation(data: unknown) {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const conversationId =
    "conversationId" in data &&
    typeof data.conversationId === "string" &&
    data.conversationId.trim()
      ? data.conversationId
      : null;

  if (!conversationId) {
    return null;
  }

  const interactionId =
    "interactionId" in data &&
    typeof data.interactionId === "string" &&
    data.interactionId.trim()
      ? data.interactionId
      : null;

  const rawMessages = "messages" in data ? data.messages : null;
  if (!Array.isArray(rawMessages)) {
    return null;
  }

  const messages: ChatMessageItem[] = [];
  for (const item of rawMessages) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const id =
      "id" in item && typeof item.id === "string" && item.id.trim()
        ? item.id
        : null;
    const role =
      "role" in item && (item.role === "user" || item.role === "assistant")
        ? item.role
        : null;
    const content =
      "content" in item && typeof item.content === "string" ? item.content : null;

    if (!id || !role || content === null) {
      continue;
    }

    messages.push({ id, role, content });
  }

  return { conversationId, interactionId, messages };
}

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const isPendingRef = useRef(false);
  const interactionIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  async function addMessage(content: string) {
    if (isPendingRef.current || isRestoring) return;

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
        saveConversationId(nextConversationId);
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
    let cancelled = false;

    async function restoreConversation() {
      const savedId = getSavedConversationId();

      if (!savedId) {
        if (!cancelled) {
          setMessages([WELCOME_MESSAGE]);
          setIsRestoring(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/conversations/${savedId}`);

        if (!response.ok) {
          if (response.status === 404 || response.status === 400) {
            clearSavedConversationId();
          }
          if (!cancelled) {
            setMessages([WELCOME_MESSAGE]);
          }
          return;
        }

        const restored = parseRestoredConversation(await response.json());

        if (!restored) {
          clearSavedConversationId();
          if (!cancelled) {
            setMessages([WELCOME_MESSAGE]);
          }
          return;
        }

        if (cancelled) return;

        conversationIdRef.current = restored.conversationId;
        interactionIdRef.current = restored.interactionId;
        setMessages(
          restored.messages.length > 0 ? restored.messages : [WELCOME_MESSAGE],
        );
      } catch {
        if (!cancelled) {
          setMessages([WELCOME_MESSAGE]);
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    }

    void restoreConversation();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, isPending, isRestoring]);

  return (
    <div className="flex min-h-dvh justify-center bg-[#F7F4FA]">
      <div className="flex h-dvh w-full min-w-0 max-w-lg flex-col bg-white md:my-6 md:h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-3xl md:border md:border-[#E6DDEC] md:shadow-[0_6px_24px_rgba(91,61,143,0.06)]">
        <ChatHeader />

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4"
          aria-busy={isPending || isRestoring}
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

        <ChatInput onSend={addMessage} disabled={isPending || isRestoring} />
      </div>
    </div>
  );
}
