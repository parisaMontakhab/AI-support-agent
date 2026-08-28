const CONVERSATION_ID_KEY = "ai-support-agent:conversationId";

export function getSavedConversationId() {
  try {
    const value = localStorage.getItem(CONVERSATION_ID_KEY);
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export function saveConversationId(conversationId: string) {
  try {
    localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
  } catch {
    // Ignore storage failures so chat still works.
  }
}

export function clearSavedConversationId() {
  try {
    localStorage.removeItem(CONVERSATION_ID_KEY);
  } catch {
    // Ignore storage failures so chat still works.
  }
}
