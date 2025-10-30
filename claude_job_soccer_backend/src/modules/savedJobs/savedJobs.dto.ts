import { z } from "zod";

export const addSavedJobSchema = z.object({
  body: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID format"),
  }),
});

export const removeSavedJobSchema = z.object({
  params: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID format"),
  }),
});

export type TAddSavedJob = z.infer<typeof addSavedJobSchema>;
export type TRemoveSavedJob = z.infer<typeof removeSavedJobSchema>;
