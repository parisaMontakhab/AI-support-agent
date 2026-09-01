"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import {
  ChatMessage,
  ChatMessageSkeleton,
  type ChatMessageItem,
} from "@/components/chat/chat-message";
import {
  ChatSidebar,
  type ConversationHistoryItem,
} from "@/components/chat/chat-sidebar";

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

  return { conversationId, messages };
}

function parseConversationList(data: unknown): ConversationHistoryItem[] {
  if (typeof data !== "object" || data === null || !("conversations" in data)) {
    return [];
  }

  const raw = data.conversations;
  if (!Array.isArray(raw)) {
    return [];
  }

  const conversations: ConversationHistoryItem[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const id =
      "id" in item && typeof item.id === "string" && item.id.trim()
        ? item.id
        : null;
    const title =
      "title" in item && typeof item.title === "string" && item.title.trim()
        ? item.title
        : "New chat";

    if (!id) {
      continue;
    }

    conversations.push({ id, title });
  }

  return conversations;
}

type ChatAppProps = {
  initialConversations: ConversationHistoryItem[];
};

export function ChatApp({ initialConversations }: ChatAppProps) {
  const params = useParams<{ conversationId?: string }>();
  const router = useRouter();
  const conversationId =
    typeof params.conversationId === "string" ? params.conversationId : null;

  const [messages, setMessages] = useState<ChatMessageItem[]>(
    conversationId ? [] : [WELCOME_MESSAGE],
  );
  const [isPending, setIsPending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(Boolean(conversationId));
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [conversations, setConversations] =
    useState<ConversationHistoryItem[]>(initialConversations);
  const [displayedId, setDisplayedId] = useState(conversationId);
  const [loadedConversationId, setLoadedConversationId] = useState<
    string | null
  >(null);

  const listRef = useRef<HTMLDivElement>(null);
  const isPendingRef = useRef(false);
  const turnRef = useRef(0);

  if (displayedId !== conversationId) {
    setDisplayedId(conversationId);

    if (!conversationId) {
      setLoadedConversationId(null);
      setIsPending(false);
      setIsRestoring(false);
      setMessages([WELCOME_MESSAGE]);
    } else if (loadedConversationId !== conversationId) {
      setIsPending(false);
      setIsRestoring(true);
      setMessages([]);
    }
  }

  async function refreshConversations() {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) return;
      setConversations(parseConversationList(await response.json()));
    } catch {
      // History is optional; the current chat can still work.
    }
  }

  const resetToNewChat = useCallback(() => {
    turnRef.current += 1;
    isPendingRef.current = false;
    setLoadedConversationId(null);
    setIsPending(false);
    setIsRestoring(false);
    setMessages([WELCOME_MESSAGE]);
  }, []);

  function handleNewChat() {
    setIsHistoryOpen(false);
    turnRef.current += 1;
    isPendingRef.current = false;
    setIsPending(false);
    if (!conversationId) {
      resetToNewChat();
    }
  }

  async function addMessage(content: string) {
    if (isPendingRef.current || isRestoring) return;

    const turn = ++turnRef.current;
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
          ...(loadedConversationId
            ? { conversationId: loadedConversationId }
            : {}),
        }),
      });

      const data: unknown = await response.json();
      if (turn !== turnRef.current) return;

      const reply =
        typeof data === "object" &&
        data !== null &&
        "reply" in data &&
        typeof data.reply === "string" &&
        data.reply.trim()
          ? data.reply
          : "Sorry, I could not generate a reply.";

      const nextConversationId =
        typeof data === "object" &&
        data !== null &&
        "conversationId" in data &&
        typeof data.conversationId === "string" &&
        data.conversationId.trim()
          ? data.conversationId
          : null;

      if (nextConversationId) {
        setLoadedConversationId(nextConversationId);
        if (nextConversationId !== conversationId) {
          router.replace(`/chat/${nextConversationId}`);
        }
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
        },
      ]);
      void refreshConversations();
    } catch {
      if (turn !== turnRef.current) return;
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I could not generate a reply.",
        },
      ]);
    } finally {
      if (turn !== turnRef.current) return;
      isPendingRef.current = false;
      setIsPending(false);
    }
  }

  useEffect(() => {
    if (!conversationId || loadedConversationId === conversationId) {
      return;
    }

    let cancelled = false;

    async function loadConversation() {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);

        if (!response.ok) {
          if (!cancelled) {
            resetToNewChat();
            router.replace("/chat");
          }
          return;
        }

        const restored = parseRestoredConversation(await response.json());

        if (!restored) {
          if (!cancelled) {
            resetToNewChat();
            router.replace("/chat");
          }
          return;
        }

        if (cancelled) return;

        setLoadedConversationId(restored.conversationId);
        setMessages(
          restored.messages.length > 0 ? restored.messages : [WELCOME_MESSAGE],
        );
      } catch {
        if (!cancelled) {
          resetToNewChat();
          router.replace("/chat");
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    }

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId, loadedConversationId, resetToNewChat, router]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, isPending, isRestoring]);

  return (
    <div className="flex min-h-dvh justify-center bg-[#F7F4FA]">
      <div className="relative flex h-dvh w-full min-w-0 max-w-lg flex-col bg-white md:my-6 md:h-[calc(100dvh-3rem)] md:max-w-3xl md:flex-row md:overflow-hidden md:rounded-3xl md:border md:border-[#E6DDEC] md:shadow-[0_6px_24px_rgba(91,61,143,0.06)]">
        <ChatSidebar
          conversations={conversations}
          activeId={conversationId}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onNewChat={handleNewChat}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
          <ChatHeader onOpenHistory={() => setIsHistoryOpen(true)} />

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
    </div>
  );
}
