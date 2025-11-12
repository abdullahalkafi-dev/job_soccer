import { model, Model, Schema } from "mongoose";
import { IChatDocument, IChatModel, TChat } from "./chat.interface";

const chatSchema = new Schema<IChatDocument>(
  {
    users: {
      type: [
        { type: Schema.Types.ObjectId, ref: "User", required: true },
        { type: Schema.Types.ObjectId, ref: "User", required: true },
      ],
      required: true,
      validate: {
        validator: function (users: any[]) {
          return users.length === 2 && users[0].toString() !== users[1].toString();
        },
        message: "Chat must have exactly 2 different users",
      },
    },
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
chatSchema.index({ users: 1 });
chatSchema.index({ "users.0": 1, "users.1": 1 });
chatSchema.index({ latestMessage: 1 });
chatSchema.index({ isBlocked: 1 });
chatSchema.index({ createdAt: -1 });

// Static method to get chat between two users
chatSchema.statics.getChatBetweenUsers = async function (
  user1Id: string,
  user2Id: string
): Promise<IChatDocument | null> {
  return await this.findOne({
    users: { $all: [user1Id, user2Id] },
  }).populate("latestMessage");
};

// Static method to check if user is blocked
chatSchema.statics.isUserBlocked = async function (
  chatId: string,
  userId: string
): Promise<boolean> {
  const chat = await this.findById(chatId);
  if (!chat) return false;
  
  return chat.isBlocked && chat.blockedBy?.toString() !== userId;
};

export const Chat = model<IChatDocument, Model<IChatDocument> & IChatModel>(
  "Chat",
  chatSchema,
  "chats"
);
