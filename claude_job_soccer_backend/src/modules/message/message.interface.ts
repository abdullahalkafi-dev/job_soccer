import { Types, Document } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
}

export type TMessage = {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content?: string;
  mediaUrl?: string;
  messageType: MessageType;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface IMessageDocument extends TMessage, Document {
  _id: Types.ObjectId;
}

export interface IMessageModel {
  getMessagesByChatId(chatId: string, limit?: number, skip?: number): Promise<IMessageDocument[]>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;
}
