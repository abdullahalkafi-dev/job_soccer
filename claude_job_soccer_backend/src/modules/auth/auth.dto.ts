import { z } from "zod";

const loginUser = z.object({
  body: z
    .object({
      email: z.string(),
      password: z.string().optional(),
      loginProvider: z.enum(["linkedin", "email"]),
    })
    .strict(),
});








const createForgetPassword = z.object({
  body: z
    .object({
      email: z.string(),
    })
    .strict(),
});

const createResetPassword = z.object({
  body: z
    .object({
      newPassword: z.string({ required_error: "Password is required" }),
      confirmPassword: z.string({
        required_error: "Confirm Password is required",
      }),
    })
    .strict(),
});

const createChangePassword = z.object({
  body: z
    .object({
      currentPassword: z.string({
        required_error: "Current Password is required",
      }),
      newPassword: z.string({ required_error: "New Password is required" }),
      confirmPassword: z.string({
        required_error: "Confirm Password is required",
      }),
    })
    .strict(),
});

export const AuthValidation = {
  loginUser,
  createForgetPassword,
  createResetPassword,
  createChangePassword,
};
