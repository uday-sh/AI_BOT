import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  userId: string;
  messages: { role: "user" | "bot"; content: string }[];
  createdAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ["user", "bot"], required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);
