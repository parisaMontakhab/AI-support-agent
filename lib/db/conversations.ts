import "server-only";

import mongoose from "mongoose";
import { conversationTitleFromMessage } from "@/lib/chat/conversation-title";
import { connectMongo } from "@/lib/db/mongoose";
import { getFirstUserMessagesByConversationIds } from "@/lib/db/messages";
import {
  Conversation,
  type ConversationRecord,
} from "@/lib/models/Conversation";

export type { ConversationRecord };

function parseConversationId(value: string): mongoose.Types.ObjectId | null {
  if (!/^[a-fA-F0-9]{24}$/.test(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
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
  await connectMongo();
  const objectId = parseConversationId(id);
  if (!objectId) {
    return null;
  }

  return Conversation.findById(objectId).lean<ConversationRecord>().exec();
}

export async function listConversations() {
  await connectMongo();
  const items = await Conversation.find({})
    .sort({ updatedAt: -1, _id: -1 })
    .lean<ConversationRecord[]>()
    .exec();
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
    await Conversation.bulkWrite(writes);
  }

  return items;
}

export async function createConversation(title: string) {
  await connectMongo();
  const now = new Date();
  const created = await Conversation.create({
    title,
    interactionId: null,
    createdAt: now,
    updatedAt: now,
  });

  return created.toObject();
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

export async function touchConversation(
  conversationId: mongoose.Types.ObjectId,
) {
  await connectMongo();
  const now = new Date();

  await Conversation.updateOne(
    { _id: conversationId },
    {
      $set: {
        updatedAt: now,
      },
    },
  );
}
