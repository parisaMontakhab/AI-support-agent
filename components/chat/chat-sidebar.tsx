"use client";

import Link from "next/link";

export type ConversationHistoryItem = {
  id: string;
  title: string;
};

type ChatSidebarProps = {
  conversations: ConversationHistoryItem[];
  activeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
};

export function ChatSidebar({
  conversations,
  activeId,
  isOpen,
  onClose,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close conversation history"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#2d2640]/25 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-[#E6DDEC] bg-[#FBF8FC] transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 md:pointer-events-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#EEE8F4] px-3 py-3">
          <p className="text-sm font-semibold text-ink">Chats</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversation history"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-lavender hover:text-ink md:hidden"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                d="m6 6 8 8M14 6l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="p-3">
          <Link
            href="/chat"
            onClick={onNewChat}
            className="flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            New Chat
          </Link>
        </div>

        <nav
          aria-label="Conversation history"
          className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
        >
          {conversations.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted">No conversations yet</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {conversations.map((conversation) => {
                const isActive = conversation.id === activeId;

                return (
                  <li key={conversation.id}>
                    <Link
                      href={`/chat/${conversation.id}`}
                      onClick={onClose}
                      className={`block rounded-xl px-3 py-2 text-sm leading-5 ${
                        isActive
                          ? "bg-lavender font-medium text-ink"
                          : "text-muted hover:bg-lavender/70 hover:text-ink"
                      }`}
                    >
                      <span className="line-clamp-2">{conversation.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}
