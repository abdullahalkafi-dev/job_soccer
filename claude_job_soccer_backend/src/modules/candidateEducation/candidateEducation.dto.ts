import { z } from "zod";

export const addEducationSchema = z.object({
  body: z.object({
    instituteName: z.string().min(1, "Institute name is required"),
    degree: z.string().min(1, "Degree is required"),
    fieldOfStudy: z.string().min(1, "Field of study is required"),
    startMonth: z.string().min(1, "Start month is required"),
    startYear: z.number().min(1900).max(new Date().getFullYear() + 10),
    endMonth: z.string().optional(),
    endYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const updateEducationSchema = z.object({
  params: z.object({
    educationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid education ID format"),
  }),
  body: z.object({
    instituteName: z.string().min(1, "Institute name is required").optional(),
    degree: z.string().min(1, "Degree is required").optional(),
    fieldOfStudy: z.string().min(1, "Field of study is required").optional(),
    startMonth: z.string().min(1, "Start month is required").optional(),
    startYear: z
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 10)
      .optional(),
    endMonth: z.string().optional(),
    endYear: z
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 10)
      .optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const removeEducationSchema = z.object({
  params: z.object({
    educationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid education ID format"),
  }),
});

export const getEducationsByUserSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  }),
});

export const getEducationByIdSchema = z.object({
  params: z.object({
    educationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid education ID format"),
  }),
});

export type TAddEducation = z.infer<typeof addEducationSchema>;
export type TUpdateEducation = z.infer<typeof updateEducationSchema>;
export type TRemoveEducation = z.infer<typeof removeEducationSchema>;
export type TGetEducationsByUser = z.infer<typeof getEducationsByUserSchema>;
export type TGetEducationById = z.infer<typeof getEducationByIdSchema>;
