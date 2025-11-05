import { z } from "zod";

export const addResumeSchema = z.object({
  data: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
    setAsActive: z.boolean()
      ,
  }),
});

export const removeResumeSchema = z.object({
  params: z.object({
    resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resume ID format"),
  }),
});

export const getResumesSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  }),
});

export const getResumeByIdSchema = z.object({
  params: z.object({
    resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resume ID format"),
  }),
});

export const setActiveResumeSchema = z.object({
  params: z.object({
    resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resume ID format"),
  }),
});

export type TAddResume = z.infer<typeof addResumeSchema>;
export type TRemoveResume = z.infer<typeof removeResumeSchema>;
export type TGetResumes = z.infer<typeof getResumesSchema>;
export type TGetResumeById = z.infer<typeof getResumeByIdSchema>;
export type TSetActiveResume = z.infer<typeof setActiveResumeSchema>;
