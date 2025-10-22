import { z } from "zod";

const createCoachCanDto = z.object({
    dateOfBirth: z.date().refine((date) => date < new Date(), {
        message: "Date of birth must be in the past",
    }),
    placeOfBirth: z.string().trim().min(1, "Place of birth is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    currentClub: z.string().trim().min(1, "Current club is required"),
    position: z.enum([
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
    boyOrGirl: z.string().trim().min(1, "Boy or girl is required"),
    category: z.string().trim().min(1, "Category is required"),
    agent: z.string().trim().min(1, "Agent is required"),
    availability: z.string().trim().min(1, "Availability is required"),
    league: z.string().trim().min(1, "League is required"),
    country: z.string().min(1, "Country is required"),
    socialMedia: z.string().trim().min(1, "Social media is required"),
    licensesNumber: z.string().trim().min(1, "Licenses number is required"),
    video: z.array(
        z.object({
            title: z.string().trim().min(1, "Video title is required"),
            url: z.url("Invalid URL format"),
        })
    ),
});

const updateCoachCanDto = createCoachCanDto.partial();

export type TCreateCoachCanDto = z.infer<typeof createCoachCanDto>;
export type TUpdateCoachCanDto = z.infer<typeof updateCoachCanDto>;

export const CoachCanDto = {
    createCoachCanDto,
    updateCoachCanDto,
};
