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
