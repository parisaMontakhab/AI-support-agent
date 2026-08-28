import "server-only";

import { ObjectId, type Collection } from "mongodb";
import { getDb } from "@/lib/db/mongodb";

export type MessageRole = "user" | "assistant";

export type MessageRecord = {
  _id: ObjectId;
  conversationId: ObjectId;
  role: MessageRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

async function messagesCollection(): Promise<Collection<MessageRecord>> {
  const db = await getDb();
  return db.collection<MessageRecord>("messages");
}

export async function listMessagesByConversationId(conversationId: ObjectId) {
  const messages = await messagesCollection();
  return messages
    .find({ conversationId })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();
}

export async function getFirstUserMessagesByConversationIds(
  conversationIds: ObjectId[],
) {
  if (conversationIds.length === 0) {
    return new Map<string, string>();
  }

  const messages = await messagesCollection();
  const rows = await messages
    .aggregate<{ _id: ObjectId; content: string }>([
      {
        $match: {
          conversationId: { $in: conversationIds },
          role: "user",
        },
      },
      { $sort: { createdAt: 1, _id: 1 } },
      {
        $group: {
          _id: "$conversationId",
          content: { $first: "$content" },
        },
      },
    ])
    .toArray();

  return new Map(
    rows.map((row) => [row._id.toHexString(), row.content]),
  );
}

export async function saveMessage(input: {
  conversationId: ObjectId;
  role: MessageRole;
  content: string;
}) {
  const now = new Date();
  const message: MessageRecord = {
    _id: new ObjectId(),
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };

  const messages = await messagesCollection();
  await messages.insertOne(message);
  return message;
}
