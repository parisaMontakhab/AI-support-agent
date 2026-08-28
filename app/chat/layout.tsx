import type { Metadata } from "next";
import { ChatApp } from "@/components/chat/chat-app";
import {
  listConversations,
  serializeConversation,
} from "@/lib/db/conversations";

export const metadata: Metadata = {
  title: "Chat",
};

export default async function ChatLayout({ children }: LayoutProps<"/chat">) {
  let initialConversations: { id: string; title: string }[] = [];

  try {
    const conversations = await listConversations();
    initialConversations = conversations.map((conversation) => {
      const item = serializeConversation(conversation);
      return { id: item.id, title: item.title };
    });
  } catch {
    initialConversations = [];
  }

  return (
    <>
      <ChatApp initialConversations={initialConversations} />
      {children}
    </>
  );
}
