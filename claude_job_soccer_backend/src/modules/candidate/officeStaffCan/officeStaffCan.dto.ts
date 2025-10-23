import { z } from "zod";
import { countryList } from "../../../shared/constant/country.constant";

const createOfficeStaffCanDto = z.object({
  dateOfBirth: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Date of birth must be a valid date in the past",
      }
    )
    .transform((date) => new Date(date)),
  placeOfBirth: z.string().trim().min(1, "Place of birth is required"),
  country: z
    .enum(countryList as [string, ...string[]])
    .refine((val) => countryList.includes(val), {
      message: "Please select a valid country",
    }),
  nationality: z.string().trim().min(1, "Nationality is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  position: z.enum([
    "Administrative Director",
    "Community Manager",
    "Data Analyst",
    "Digital Marketing",
    "Medical Staff",
    "Performance Staff",
    "Equipment Staff",
    "Sales",
  ]),
  languages: z.string().trim().optional(),
  availability: z.string().trim().min(1, "Availability is required"),
  licensesNumber: z.string().trim().min(1, "Licenses number is required"),
  agent: z.string().trim().min(1, "Agent is required"),
  socialMedia: z.string().trim().min(1, "Social media is required"),
  // Videos will be handled separately through file upload
  videos: z.array(
    z.object({
      videoType: z.string().min(1, "Video type is required"),
      url: z.string().min(1, "Video URL is required"),
      duration: z.number().min(0, "Duration must be non-negative"), // Duration validation handled by frontend
      title: z.string().optional(),
      description: z.string().optional(),
      uploadedAt: z.date().optional(),
    })
  ).optional(),
});

const updateOfficeStaffCanDto = createOfficeStaffCanDto.partial();

export type TCreateOfficeStaffCanDto = z.infer<typeof createOfficeStaffCanDto>;
export type TUpdateOfficeStaffCanDto = z.infer<typeof updateOfficeStaffCanDto>;

export const OfficeStaffCanDto = {
  createOfficeStaffCanDto,
  updateOfficeStaffCanDto,
};
