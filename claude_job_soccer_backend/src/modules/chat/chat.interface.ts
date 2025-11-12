import { Types, Document } from "mongoose";

export type TChat = {
  users: [Types.ObjectId, Types.ObjectId];
  latestMessage?: Types.ObjectId;
  isBlocked: boolean;
  blockedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export interface IChatDocument extends TChat, Document {
  _id: Types.ObjectId;
}

export interface IChatModel {
  getChatBetweenUsers(user1Id: string, user2Id: string): Promise<IChatDocument | null>;
  isUserBlocked(chatId: string, userId: string): Promise<boolean>;
}
