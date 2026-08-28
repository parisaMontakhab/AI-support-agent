import "server-only";

import { ObjectId, type Collection } from "mongodb";
import { getDb } from "@/lib/db/mongodb";

export type ConversationRecord = {
  _id: ObjectId;
  interactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

async function conversationsCollection(): Promise<
  Collection<ConversationRecord>
> {
  const db = await getDb();
  return db.collection<ConversationRecord>("conversations");
}

function parseConversationId(value: string): ObjectId | null {
  if (!/^[a-fA-F0-9]{24}$/.test(value)) {
    return null;
  }

  return new ObjectId(value);
}

export async function getConversationById(id: string) {
  const objectId = parseConversationId(id);
  if (!objectId) {
    return null;
  }

  const conversations = await conversationsCollection();
  return conversations.findOne({ _id: objectId });
}

export async function createConversation() {
  const now = new Date();
  const conversation: ConversationRecord = {
    _id: new ObjectId(),
    interactionId: null,
    createdAt: now,
    updatedAt: now,
  };

  const conversations = await conversationsCollection();
  await conversations.insertOne(conversation);
  return conversation;
}

export async function getOrCreateConversation(id?: string) {
  if (id) {
    const existing = await getConversationById(id);
    if (existing) {
      return existing;
    }
  }

  return createConversation();
}

export async function updateConversationInteractionId(
  conversationId: ObjectId,
  interactionId: string,
) {
  const now = new Date();
  const conversations = await conversationsCollection();

  await conversations.updateOne(
    { _id: conversationId },
    {
      $set: {
        interactionId,
        updatedAt: now,
      },
    },
  );
}
