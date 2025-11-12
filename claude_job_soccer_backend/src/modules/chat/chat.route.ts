import { Router } from "express";
import auth from "../../shared/middlewares/auth";
import { ChatController } from "./chat.controller";
import validateRequest from "../../shared/middlewares/validateRequest";
import { z } from "zod";

const router = Router();

// Validation schemas
const createOrGetChatSchema = z.object({
  body: z.object({
    otherUserId: z.string().min(1, "Other user ID is required"),
  }),
});

// Routes
router.post(
  "/create-or-get",
  auth("candidate", "employer"),
  validateRequest(createOrGetChatSchema),
  ChatController.createOrGetChat
);

router.get(
  "/my-chats",
  auth("candidate", "employer"),
  ChatController.getUserChats
);

router.get(
  "/blocked",
  auth("candidate", "employer"),
  ChatController.getBlockedChats
);

router.get(
  "/:chatId",
  auth("candidate", "employer"),
  ChatController.getChatById
);

router.post(
  "/:chatId/block",
  auth("candidate", "employer"),
  ChatController.blockUser
);

router.post(
  "/:chatId/unblock",
  auth("candidate", "employer"),
  ChatController.unblockUser
);

router.delete(
  "/:chatId",
  auth("candidate", "employer"),
  ChatController.deleteChat
);

export const ChatRoutes: Router = router;
