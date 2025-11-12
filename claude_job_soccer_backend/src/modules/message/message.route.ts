import { Router } from "express";
import auth from "../../shared/middlewares/auth";
import { MessageController } from "./message.controller";
import validateRequest from "../../shared/middlewares/validateRequest";
import { z } from "zod";
import { MessageType } from "./message.interface";

const router = Router();

// Validation schemas
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

// Routes
router.post(
  "/send",
  auth("candidate", "employer"),
  validateRequest(createMessageSchema),
  MessageController.createMessage
);

router.get(
  "/chat/:chatId",
  auth("candidate", "employer"),
  MessageController.getMessagesByChatId
);

router.post(
  "/chat/:chatId/mark-read",
  auth("candidate", "employer"),
  MessageController.markMessagesAsRead
);

router.get(
  "/unread-count",
  auth("candidate", "employer"),
  MessageController.getUnreadMessageCount
);

router.get(
  "/chat/:chatId/search",
  auth("candidate", "employer"),
  validateRequest(searchMessagesSchema),
  MessageController.searchMessages
);

router.delete(
  "/:messageId",
  auth("candidate", "employer"),
  MessageController.deleteMessage
);

export const MessageRoutes: Router = router;
