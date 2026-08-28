import { getConversationById } from "@/lib/db/conversations";
import { listMessagesByConversationId } from "@/lib/db/messages";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;

  try {
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return Response.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    const messages = await listMessagesByConversationId(conversation._id);

    return Response.json({
      conversationId: conversation._id.toHexString(),
      interactionId: conversation.interactionId,
      messages: messages.map((message) => ({
        id: message._id.toHexString(),
        role: message.role,
        content: message.content,
      })),
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to load conversation.";

    return Response.json({ error: detail }, { status: 500 });
  }
}
