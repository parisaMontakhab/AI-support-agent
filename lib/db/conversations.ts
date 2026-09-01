import "server-only";

import { ObjectId, type Collection } from "mongodb";
import { conversationTitleFromMessage } from "@/lib/chat/conversation-title";
import { getFirstUserMessagesByConversationIds } from "@/lib/db/messages";
import { getDb } from "@/lib/db/mongodb";

export type ConversationRecord = {
  _id: ObjectId;
  title?: string | null;
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

export function serializeConversation(conversation: ConversationRecord) {
  return {
    id: conversation._id.toHexString(),
    title: conversation.title?.trim() || "New chat",
    interactionId: conversation.interactionId,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function getConversationById(id: string) {
  const objectId = parseConversationId(id);
  if (!objectId) {
    return null;
  }

  const conversations = await conversationsCollection();
  return conversations.findOne({ _id: objectId });
}

export async function listConversations() {
  const conversations = await conversationsCollection();
  const items = await conversations.find({}).sort({ updatedAt: -1, _id: -1 }).toArray();
  const untitled = items.filter((item) => !item.title?.trim());

  if (untitled.length === 0) {
    return items;
  }

  const firstMessages = await getFirstUserMessagesByConversationIds(
    untitled.map((item) => item._id),
  );
  const writes = [];

  for (const item of untitled) {
    const content = firstMessages.get(item._id.toHexString());
    if (!content) continue;
    const title = conversationTitleFromMessage(content);
    item.title = title;
    writes.push({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { title } },
      },
    });
  }

  if (writes.length > 0) {
    await conversations.bulkWrite(writes);
  }

  return items;
}

export async function createConversation(title: string) {
  const now = new Date();
  const conversation: ConversationRecord = {
    _id: new ObjectId(),
    title,
    interactionId: null,
    createdAt: now,
    updatedAt: now,
  };

  const conversations = await conversationsCollection();
  await conversations.insertOne(conversation);
  return conversation;
}

export async function getOrCreateConversation(id?: string, title?: string) {
  if (id) {
    const existing = await getConversationById(id);
    if (existing) {
      return existing;
    }
  }

  return createConversation(title || "New chat");
}

export async function touchConversation(conversationId: ObjectId) {
  const now = new Date();
  const conversations = await conversationsCollection();

  await conversations.updateOne(
    { _id: conversationId },
    {
      $set: {
        updatedAt: now,
      },
    },
  );
}
