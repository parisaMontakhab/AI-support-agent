const TITLE_MAX_LENGTH = 56;

export function conversationTitleFromMessage(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "New chat";
  }

  if (normalized.length <= TITLE_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, TITLE_MAX_LENGTH - 1).trimEnd()}…`;
}
