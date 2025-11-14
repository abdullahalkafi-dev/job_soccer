import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Message } from "./message.model";
import { IMessageDocument, MessageType } from "./message.interface";
import { Chat } from "../chat/chat.model";
import { User } from "../user/user.model";
import { logger } from "../../shared/logger/logger";

interface ICreateMessagePayload {
  chatId: string;
  senderId: string;
  receiverId: string;
  content?: string;
  mediaUrl?: string;
  messageType: MessageType;
}

const createMessage = async (
  payload: ICreateMessagePayload
): Promise<IMessageDocument> => {
  const { chatId, senderId, receiverId } = payload;
 console.log(payload);
  // Verify chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError(StatusCodes.NOT_FOUND, "Chat not found");
  }
console.log(chat);
  // Verify users are part of the chat
  const isUserInChat = chat.users.some(
    (userId) =>
      userId.toString() === senderId || userId.toString() === receiverId
  );

  if (!isUserInChat) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Users are not part of this chat"
    );
  }

  // Check if chat is blocked
  if (chat.isBlocked) {
    // Find who is blocked
    const isSenderBlocked = chat.blockedBy?.toString() !== senderId;
    if (isSenderBlocked) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You cannot send messages to this user. They have blocked you."
      );
    }
  }

  // Verify sender and receiver exist
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);
logger.info(sender)
logger.info(receiver)
  if (!sender || !receiver) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Sender or receiver not found"
    );
  }

  // Create message
  const message = await Message.create(payload);

  // Update chat's latest message
  chat.latestMessage = message._id;
  await chat.save();

  // Populate sender and receiver info
  await message.populate("senderId", "firstName lastName profileImage");
  await message.populate("receiverId", "firstName lastName profileImage");

  return message;
};

const getMessagesByChatId = async (
  chatId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ messages: IMessageDocument[]; total: number }> => {
  // Verify chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError(StatusCodes.NOT_FOUND, "Chat not found");
  }

  // Verify user is part of the chat
  const isUserInChat = chat.users.some(
    (user) => user.toString() === userId
  );

  if (!isUserInChat) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to view this chat"
    );
  }

  const skip = (page - 1) * limit;

  const messages = await Message.getMessagesByChatId(chatId, limit, skip);
  const total = await Message.countDocuments({ chatId, isDeleted: false });

  return { messages, total };
};

const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<{ message: string }> => {
  // Verify chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError(StatusCodes.NOT_FOUND, "Chat not found");
  }

  // Verify user is part of the chat
  const isUserInChat = chat.users.some(
    (user) => user.toString() === userId
  );

  if (!isUserInChat) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to access this chat"
    );
  }

  await Message.markMessagesAsRead(chatId, userId);

  return { message: "Messages marked as read" };
};

const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<{ message: string }> => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError(StatusCodes.NOT_FOUND, "Message not found");
  }

  // Only sender can delete their message
  if (message.senderId.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only delete your own messages"
    );
  }

  message.isDeleted = true;
  await message.save();

  return { message: "Message deleted successfully" };
};

const getUnreadMessageCount = async (userId: string): Promise<number> => {
  const count = await Message.countDocuments({
    receiverId: userId,
    isRead: false,
    isDeleted: false,
  });

  return count;
};

const searchMessages = async (
  chatId: string,
  userId: string,
  searchTerm: string
): Promise<IMessageDocument[]> => {
  // Verify chat exists and user is part of it
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError(StatusCodes.NOT_FOUND, "Chat not found");
  }

  const isUserInChat = chat.users.some(
    (user) => user.toString() === userId
  );

  if (!isUserInChat) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to search this chat"
    );
  }

  const messages = await Message.find({
    chatId,
    isDeleted: false,
    content: { $regex: searchTerm, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("senderId", "firstName lastName profileImage")
    .populate("receiverId", "firstName lastName profileImage");

  return messages;
};

export const MessageService = {
  createMessage,
  getMessagesByChatId,
  markMessagesAsRead,
  deleteMessage,
  getUnreadMessageCount,
  searchMessages,
};
