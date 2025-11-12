import { model, Model, Schema } from "mongoose";
import { IMessageDocument, IMessageModel, MessageType, TMessage } from "./message.interface";

const messageSchema = new Schema<IMessageDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat ID is required"],
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required"],
      index: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Message content cannot exceed 5000 characters"],
    },
    mediaUrl: {
      type: String,
      trim: true,
    },
    messageType: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ chatId: 1, isDeleted: 1 });

// Validation: Either content or mediaUrl must be present
messageSchema.pre("validate", function (next) {
  if (!this.content && !this.mediaUrl) {
    next(new Error("Either content or mediaUrl must be provided"));
  }
  
  if (this.messageType !== MessageType.TEXT && !this.mediaUrl) {
    next(new Error(`mediaUrl is required for ${this.messageType} messages`));
  }
  
  next();
});

// Static method to get messages by chat ID
messageSchema.statics.getMessagesByChatId = async function (
  chatId: string,
  limit: number = 50,
  skip: number = 0
): Promise<IMessageDocument[]> {
  return await this.find({ chatId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("senderId", "firstName lastName profileImage")
    .populate("receiverId", "firstName lastName profileImage");
};

// Static method to mark messages as read
messageSchema.statics.markMessagesAsRead = async function (
  chatId: string,
  userId: string
): Promise<void> {
  await this.updateMany(
    { 
      chatId, 
      receiverId: userId, 
      isRead: false 
    },
    { isRead: true }
  );
};

export const Message = model<IMessageDocument, Model<IMessageDocument> & IMessageModel>(
  "Message",
  messageSchema,
  "messages"
);
