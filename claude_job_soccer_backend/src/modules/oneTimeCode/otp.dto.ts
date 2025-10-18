import z from "zod";

const createOneTimeCodeDto = z.object({
  userId: z.string(),
  reason: z.enum(["account_verification", "password_reset"]),
  oneTimeCode: z.string().length(6), 
  expireAt: z
    .date()
    .refine(
      (date) => date > new Date(),
      { message: "Expiration time must be in the future" }
    ),
});
const validateOneTimeCodeDto = z.object({
  userId: z.string(),
  reason: z.enum(["account_verification", "password_reset"]),
  oneTimeCode: z.string().length(6),
});

export const OneTimeCodeDto = {
  createOneTimeCodeDto,
  validateOneTimeCodeDto,
};