import express, { Router } from "express";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../shared/middlewares/validateRequest";
const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.Login),
  AuthController.loginUser
);
router.post(
  "/forgot-password",
  validateRequest(AuthValidation.createForgetPassword),
  AuthController.forgetPassword
);
router.post(
  "/verify-email",
  validateRequest(AuthValidation.createVerifyEmail),
  AuthController.verifyEmail
);
router.post(
  "/reset-password",
  validateRequest(AuthValidation.createResetPassword),
  AuthController.resetPassword
);
router.delete(
  "/delete-account",
  // auth(USER_ROLES.USER),
  AuthController.deleteAccount
);
router.post(
  "/change-password",
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  validateRequest(AuthValidation.createChangePassword),
  AuthController.changePassword
);
router.post("/send-otp", AuthController.resendOtp);
router.post(
  "/logout",
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  AuthController.logoutUser
);
export const AuthRoutes: Router = router;
