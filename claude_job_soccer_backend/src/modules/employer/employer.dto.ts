import { z } from "zod";

/**
 * Validation schema for searching employers
 */
const searchEmployersDto = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    role: z
      .enum([
        "Professional Club",
        "Academy",
        "Amateur Club",
        "Consulting Company",
        "High School",
        "College/University",
        "Agent",
      ])
      .optional(),
    country: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
  }),
});

export const EmployerValidation = {
  searchEmployersDto,
};
