import { Router } from "express";
import auth from "../../shared/middlewares/auth";
import { MessageController } from "./message.controller";
import validateRequest from "../../shared/middlewares/validateRequest";
import { z } from "zod";
import { MessageType } from "./message.interface";

const router = Router();

/**
 * Validation schemas
 */
const createMessageSchema = z.object({
  body: z.object({
    chatId: z.string().min(1, "Chat ID is required"),
    receiverId: z.string().min(1, "Receiver ID is required"),
    content: z.string().max(5000, "Message content cannot exceed 5000 characters").optional(),
    mediaUrl: z.string().url("Invalid media URL").optional(),
    messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
  }).refine(
    (data) => data.content || data.mediaUrl,
    {
      message: "Either content or mediaUrl must be provided",
    }
  ),
});

const searchMessagesSchema = z.object({
  query: z.object({
    searchTerm: z.string().min(1, "Search term is required"),
  }),
});

/**
 * POST /api/v1/messages/send
 * Send a new message in a chat
 * Body:
 *   - chatId: string (required) - The ID of the chat
 *   - receiverId: string (required) - The ID of the message receiver
 *   - content: string (optional, max 5000 chars) - Text message content
 *   - mediaUrl: string (optional) - URL of media attachment
 *   - messageType: MessageType (default: TEXT) - Type of message (TEXT, IMAGE, VIDEO, AUDIO, FILE)
 * Note: Either content or mediaUrl must be provided
 * Auth: Required (candidate, employer)
 * Response: Created message object
 */
router.post(
  "/send",
  auth("candidate", "employer"),
  validateRequest(createMessageSchema),
  MessageController.createMessage
);

/**
 * GET /api/v1/messages/chat/:chatId
 * Get all messages in a specific chat with pagination
 * Params:
 *   - chatId: string (required) - The ID of the chat
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 50)
 * Auth: Required (candidate, employer)
 * Response: Paginated array of message objects
 */
router.get(
  "/chat/:chatId",
  auth("candidate", "employer"),
  MessageController.getMessagesByChatId
);

/**
 * POST /api/v1/messages/chat/:chatId/mark-read
 * Mark all messages in a chat as read for the authenticated user
 * Params:
 *   - chatId: string (required) - The ID of the chat
 * Auth: Required (candidate, employer)
 * Response: Success message with count of marked messages
 */
router.post(
  "/chat/:chatId/mark-read",
  auth("candidate", "employer"),
  MessageController.markMessagesAsRead
);

/**
 * GET /api/v1/messages/unread-count
 * Get total count of unread messages for the authenticated user
 * Auth: Required (candidate, employer)
 * Response: Object with unread message count
 */
router.get(
  "/unread-count",
  auth("candidate", "employer"),
  MessageController.getUnreadMessageCount
);

/**
 * GET /api/v1/messages/chat/:chatId/search
 * Search messages within a specific chat
 * Params:
 *   - chatId: string (required) - The ID of the chat
 * Query params:
 *   - searchTerm: string (required) - Search term to find in message content
 * Auth: Required (candidate, employer)
 * Response: Array of matching message objects
 */
router.get(
  "/chat/:chatId/search",
  auth("candidate", "employer"),
  validateRequest(searchMessagesSchema),
  MessageController.searchMessages
);

/**
 * DELETE /api/v1/messages/:messageId
 * Delete a specific message
 * Params:
 *   - messageId: string (required) - The ID of the message to delete
 * Auth: Required (candidate, employer)
 * Response: Success message
 */
router.delete(
  "/:messageId",
  auth("candidate", "employer"),
  MessageController.deleteMessage
);

export const MessageRoutes: Router = router;
