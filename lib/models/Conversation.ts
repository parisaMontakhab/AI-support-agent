import "server-only";

import mongoose, { Schema, type Model } from "mongoose";

export type ConversationRecord = {
  _id: mongoose.Types.ObjectId;
  title?: string | null;
  interactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const ConversationSchema = new Schema<ConversationRecord>(
  {
    title: { type: String, default: null },
    interactionId: { type: String, default: null },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "conversations",
    versionKey: false,
    timestamps: false,
    strict: true,
  },
);

export const Conversation: Model<ConversationRecord> =
  mongoose.models.Conversation ??
  mongoose.model<ConversationRecord>("Conversation", ConversationSchema);
