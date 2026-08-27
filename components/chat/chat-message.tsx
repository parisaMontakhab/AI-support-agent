export type ChatRole = "assistant" | "user";

export type ChatMessageItem = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatMessageProps = {
  role: ChatRole;
  content: string;
};

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 break-words sm:max-w-[75%] ${
          isUser
            ? "rounded-br-md bg-primary text-white"
            : "rounded-bl-md border border-line bg-white text-ink"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex w-full justify-start" role="status" aria-live="polite">
      <span className="sr-only">Assistant is typing</span>
      <div className="w-[min(70%,16rem)] rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-3">
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-[88%] animate-pulse rounded-full bg-lavender" />
          <div className="h-2.5 w-[62%] animate-pulse rounded-full bg-lavender" />
        </div>
      </div>
    </div>
  );
}
