import { buildRecentMessageContext } from "@/lib/ai/context";
import { generateSupportReply } from "@/lib/ai/gemini";
import { CUSTOMER_SUPPORT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { conversationTitleFromMessage } from "@/lib/chat/conversation-title";
import {
  getOrCreateConversation,
  touchConversation,
} from "@/lib/db/conversations";
import { listMessagesByConversationId, saveMessage } from "@/lib/db/messages";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  const conversationId =
    typeof body === "object" &&
    body !== null &&
    "conversationId" in body &&
    typeof body.conversationId === "string"
      ? body.conversationId.trim()
      : "";

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const conversation = await getOrCreateConversation(
      conversationId || undefined,
      conversationTitleFromMessage(message),
    );
    await saveMessage({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });

    const storedMessages = await listMessagesByConversationId(conversation._id);
    const recentMessages = buildRecentMessageContext(storedMessages);
    const reply = await generateSupportReply(
      recentMessages,
      CUSTOMER_SUPPORT_SYSTEM_PROMPT,
    );

    await saveMessage({
      conversationId: conversation._id,
      role: "assistant",
      content: reply,
    });
    await touchConversation(conversation._id);

    return Response.json({
      reply,
      conversationId: conversation._id.toHexString(),
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to generate a reply.";

    return Response.json({ error: detail }, { status: 500 });
  }
}
