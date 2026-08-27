import { ChatMessage } from "@/components/chat/chat-message";

export function ChatPreview() {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender text-sm font-semibold text-primary">
          A
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Aria</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Available
          </p>
        </div>
      </div>

      <div className="space-y-3 bg-canvas px-4 py-5">
        <ChatMessage
          role="assistant"
          content="Hi! 👋 How can I help you today?"
        />
        <ChatMessage role="user" content="Where is my latest order?" />
        <ChatMessage
          role="assistant"
          content="I can look that up for you. Share your order number whenever you're ready."
        />
      </div>
    </div>
  );
}
