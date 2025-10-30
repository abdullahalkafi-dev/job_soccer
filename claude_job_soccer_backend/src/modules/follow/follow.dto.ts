import { z } from "zod";

export const followEmployerSchema = z.object({
  body: z.object({
    employerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid employer ID format"),
  }),
});

export const unfollowEmployerSchema = z.object({
  params: z.object({
    employerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid employer ID format"),
  }),
});

export type TFollowEmployer = z.infer<typeof followEmployerSchema>;
export type TUnfollowEmployer = z.infer<typeof unfollowEmployerSchema>;
