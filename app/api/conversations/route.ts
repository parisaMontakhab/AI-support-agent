import {
  listConversations,
  serializeConversation,
} from "@/lib/db/conversations";

export async function GET() {
  try {
    const conversations = await listConversations();

    return Response.json({
      conversations: conversations.map((conversation) => {
        const item = serializeConversation(conversation);
        return {
          id: item.id,
          title: item.title,
          updatedAt: item.updatedAt,
        };
      }),
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to load conversations.";

    return Response.json({ error: detail }, { status: 500 });
  }
}
