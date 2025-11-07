import { z } from "zod";

export const addLicenseAndCertificationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "License/Certification name is required"),
    issuingOrganization: z.string().min(1, "Issuing organization is required"),
    startMonth: z.string().min(1, "Start month is required"),
    startYear: z.number().min(1900).max(new Date().getFullYear() + 10),
    endMonth: z.string().optional(),
    endYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.url().optional().or(z.literal("")),
    description: z.string().optional(),
  }),
});

export const updateLicenseAndCertificationSchema = z.object({
  params: z.object({
    licenseId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid license ID format"),
  }),
  body: z.object({
    name: z.string().min(1, "License/Certification name is required").optional(),
    issuingOrganization: z.string().min(1, "Issuing organization is required").optional(),
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
    credentialId: z.string().optional(),
    credentialUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
    description: z.string().optional(),
  }),
});

export const removeLicenseAndCertificationSchema = z.object({
  params: z.object({
    licenseId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid license ID format"),
  }),
});

export const getLicensesAndCertificationsByUserSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  }),
});

export const getLicenseAndCertificationByIdSchema = z.object({
  params: z.object({
    licenseId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid license ID format"),
  }),
});

export type TAddLicenseAndCertification = z.infer<typeof addLicenseAndCertificationSchema>;
export type TUpdateLicenseAndCertification = z.infer<typeof updateLicenseAndCertificationSchema>;
export type TRemoveLicenseAndCertification = z.infer<typeof removeLicenseAndCertificationSchema>;
export type TGetLicensesAndCertificationsByUser = z.infer<typeof getLicensesAndCertificationsByUserSchema>;
export type TGetLicenseAndCertificationById = z.infer<typeof getLicenseAndCertificationByIdSchema>;
