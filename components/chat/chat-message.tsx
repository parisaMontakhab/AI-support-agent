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
