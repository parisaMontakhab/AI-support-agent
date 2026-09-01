import "server-only";

export type ContextMessageRole = "user" | "assistant";

export type ContextMessage = {
  role: ContextMessageRole;
  content: string;
};

export const DEFAULT_RECENT_MESSAGE_LIMIT = 6;

export type BuildRecentMessageContextOptions = {
  limit?: number;
};

export function buildRecentMessageContext(
  messages: readonly ContextMessage[],
  options: BuildRecentMessageContextOptions = {},
): ContextMessage[] {
  const limit = Math.floor(options.limit ?? DEFAULT_RECENT_MESSAGE_LIMIT);

  if (!Number.isFinite(limit) || limit <= 0) {
    return [];
  }

  return messages.slice(-limit).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}
