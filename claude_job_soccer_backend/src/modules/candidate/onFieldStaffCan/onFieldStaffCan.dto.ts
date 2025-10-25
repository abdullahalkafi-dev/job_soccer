import { z } from "zod";

const createOnFieldStaffCanDto = z.object({
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
    nationality: z.string().trim().min(1, "Nationality is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    currentClub: z.string().trim().min(1, "Current club is required"),
    availability: z.string().trim().min(1, "Availability is required"),
    league: z.string().trim().min(1, "League is required"),
    country: z.string().min(1, "Country is required"),
    gender: z.enum(["male", "female"]),
    licensesNumber: z.string().trim().min(1, "Licenses number is required"),
    category: z.string().trim().min(1, "Category is required"),
    socialMedia: z.string().trim().min(1, "Social media is required"),
    agent: z.string().trim().min(1, "Agent is required"),
    position: z.enum([
        "Head Coach",
        "Assistant Coach",
        "GK Coach",
        "Mental Coach",
        "Video Analyst Coach",
        "Specific Offensive Coach",
        "Specific Defensive Coach",
        "Specific Technical Coach",
        "Scout",
        "Technical Director",
        "Academy Director",
        "Director of Coaching",
    ]),
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

const updateOnFieldStaffCanDto = createOnFieldStaffCanDto.partial();

export type TCreateOnFieldStaffCanDto = z.infer<typeof createOnFieldStaffCanDto>;
export type TUpdateOnFieldStaffCanDto = z.infer<typeof updateOnFieldStaffCanDto>;

export const OnFieldStaffCanDto = {
    createOnFieldStaffCanDto,
    updateOnFieldStaffCanDto,
};