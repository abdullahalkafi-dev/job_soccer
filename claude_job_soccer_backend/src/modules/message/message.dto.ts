import { z } from "zod";
import { MessageType } from "./message.interface";

export const createMessageDto = z
  .object({
    chatId: z.string().min(1, "Chat ID is required"),
    receiverId: z.string().min(1, "Receiver ID is required"),
    content: z.string().max(5000, "Content cannot exceed 5000 characters").optional(),
    mediaUrl: z.string().url("Invalid media URL").optional(),
    messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
  })
  .refine((data) => data.content || data.mediaUrl, {
    message: "Either content or mediaUrl must be provided",
  });

export const markMessagesReadDto = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
});

export const searchMessagesDto = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  searchTerm: z.string().min(1, "Search term is required"),
});

export type TCreateMessageDto = z.infer<typeof createMessageDto>;
export type TMarkMessagesReadDto = z.infer<typeof markMessagesReadDto>;
export type TSearchMessagesDto = z.infer<typeof searchMessagesDto>;
