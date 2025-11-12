import { z } from "zod";

export const createChatDto = z.object({
  otherUserId: z.string().min(1, "Other user ID is required"),
});

export const blockUserDto = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
});

export type TCreateChatDto = z.infer<typeof createChatDto>;
export type TBlockUserDto = z.infer<typeof blockUserDto>;
