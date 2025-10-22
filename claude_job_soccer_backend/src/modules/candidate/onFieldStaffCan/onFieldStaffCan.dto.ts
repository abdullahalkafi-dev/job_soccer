import { z } from "zod";

const createOnFieldStaffCanDto = z.object({
    dateOfBirth: z.date().refine((date) => date < new Date(), {
        message: "Date of birth must be in the past",
    }),
    placeOfBirth: z.string().trim().min(1, "Place of birth is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    currentClub: z.string().trim().min(1, "Current club is required"),
    availability: z.string().trim().min(1, "Availability is required"),
    league: z.string().trim().min(1, "League is required"),
    country: z.string().min(1, "Country is required"),
    licensesNumber: z.string().trim().min(1, "Licenses number is required"),
    category: z.string().trim().min(1, "Category is required"),
    socialMedia: z.string().trim().min(1, "Social media is required"),
    agent: z.string().trim().min(1, "Agent is required"),
    position: z.enum([
        "Assistant Coach",
        "GK Coach",
        "Mental Coach",
        "Video Analyst Coach",
        "Specific Forward Coach",
        "Specific Defensive Coach",
        "Specific Technical Coach",
        "Scout",
        "Technical Director",
        "Academy Director",
        "Director of Coaching",
    ]),
    video: z.array(
        z.object({
            title: z.string().trim().min(1, "Video title is required"),
            url: z.url("Invalid URL format"),
        })
    ),
});

const updateOnFieldStaffCanDto = createOnFieldStaffCanDto.partial();

export type TCreateOnFieldStaffCanDto = z.infer<typeof createOnFieldStaffCanDto>;
export type TUpdateOnFieldStaffCanDto = z.infer<typeof updateOnFieldStaffCanDto>;

export const OnFieldStaffCanDto = {
    createOnFieldStaffCanDto,
    updateOnFieldStaffCanDto,
};
