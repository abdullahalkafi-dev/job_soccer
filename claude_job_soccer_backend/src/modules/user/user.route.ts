import express, { Router } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.dto";
import fileUploadHandler from "../../shared/middlewares/fileUploadHandler";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router = express.Router();

// User routes
router.get("/", UserController.getAllUsers);
router.get("/me", auth(),UserController.getMe);
router.get("/:id", UserController.getUserById);

router.patch(
  "/:id", 
  fileUploadHandler,
  validateRequest(UserValidation.updateUser),
  UserController.updateUser
);
router.patch(
  "/:id/status",
  validateRequest(UserValidation.updateUserActivationStatus),
  UserController.updateUserActivationStatus
);
router.patch(
  "/:id/role",
  validateRequest(UserValidation.updateUserRole),
  UserController.updateUserRole
);

export const UserRoutes: Router = router;
