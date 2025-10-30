import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  body: z.object({
    receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid receiver ID format"),
  }),
});

export const respondToFriendRequestSchema = z.object({
  params: z.object({
    requestId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid request ID format"),
  }),
  body: z.object({
    status: z.enum(["accepted", "rejected"]),
  }),
});

export const removeFriendSchema = z.object({
  params: z.object({
    friendId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid friend ID format"),
  }),
});

export type TSendFriendRequest = z.infer<typeof sendFriendRequestSchema>;
export type TRespondToFriendRequest = z.infer<typeof respondToFriendRequestSchema>;
export type TRemoveFriend = z.infer<typeof removeFriendSchema>;
