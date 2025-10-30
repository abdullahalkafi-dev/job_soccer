import { model, Schema } from "mongoose";
import { TFriendList } from "./friendlist.interface";

const friendListSchema = new Schema<TFriendList>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["candidate", "employer"],
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverRole: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Compound index to ensure a user can only send one friend request to another user
friendListSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// Index for efficiently querying friend requests received by a user
friendListSchema.index({ receiverId: 1, status: 1, createdAt: -1 });

// Index for efficiently querying friend requests sent by a user
friendListSchema.index({ senderId: 1, status: 1, createdAt: -1 });

// Index for efficiently querying accepted friends
friendListSchema.index({ senderId: 1, status: 1 });
friendListSchema.index({ receiverId: 1, status: 1 });

export const FriendList = model<TFriendList>("FriendList", friendListSchema);
