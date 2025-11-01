import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format");

export const shortlistCandidateSchema = z.object({
  body: z.object({
    candidateId: objectIdSchema,
  }),
});

export const removeShortlistedCandidateSchema = z.object({
  params: z.object({
    candidateId: objectIdSchema,
  }),
});

export type TShortlistCandidate = z.infer<typeof shortlistCandidateSchema>;
export type TRemoveShortlistedCandidate = z.infer<
  typeof removeShortlistedCandidateSchema
>;
