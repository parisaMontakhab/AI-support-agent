import "server-only";

import mongoose, { Schema, type Model } from "mongoose";

export type MessageRole = "user" | "assistant";

export type MessageRecord = {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const MessageSchema = new Schema<MessageRecord>(
  {
    conversationId: { type: Schema.Types.ObjectId, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "messages",
    versionKey: false,
    timestamps: false,
    strict: true,
  },
);

export const Message: Model<MessageRecord> =
  mongoose.models.Message ??
  mongoose.model<MessageRecord>("Message", MessageSchema);
