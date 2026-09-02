import "server-only";

import mongoose from "mongoose";
import { connectMongo } from "@/lib/db/mongoose";
import {
  Message,
  type MessageRecord,
  type MessageRole,
} from "@/lib/models/Message";

export type { MessageRecord, MessageRole };

export async function listMessagesByConversationId(
  conversationId: mongoose.Types.ObjectId,
) {
  await connectMongo();
  return Message.find({ conversationId })
    .sort({ createdAt: 1, _id: 1 })
    .lean<MessageRecord[]>()
    .exec();
}

export async function getFirstUserMessagesByConversationIds(
  conversationIds: mongoose.Types.ObjectId[],
) {
  if (conversationIds.length === 0) {
    return new Map<string, string>();
  }

  await connectMongo();
  const rows = await Message.aggregate<{
    _id: mongoose.Types.ObjectId;
    content: string;
  }>([
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
  ]);

  return new Map(rows.map((row) => [row._id.toHexString(), row.content]));
}

export async function saveMessage(input: {
  conversationId: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
}) {
  await connectMongo();
  const now = new Date();
  const created = await Message.create({
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  });

  return created.toObject();
}
