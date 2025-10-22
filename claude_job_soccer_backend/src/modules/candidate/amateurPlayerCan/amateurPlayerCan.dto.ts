import { z } from "zod";

const createAmateurPlayerCanDto = z.object({
    dateOfBirth: z.date().refine((date) => date < new Date(), {
        message: "Date of birth must be in the past",
    }),
    placeOfBirth: z.string().trim().min(1, "Place of birth is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    gender: z.string().trim().min(1, "Gender is required"),
    height: z.object({
        size: z.number().positive("Height must be positive"),
        unit: z.enum(["cm", "m", "in", "ft"]),
    }),
    nationalTeamCategory: z.enum([
        "U14",
        "U15",
        "U16",
        "U17",
        "U18",
        "U19",
        "U20",
        "U21",
    ]),
    currentClub: z.string().trim().min(1, "Current club is required"),
    division: z.string().trim().min(1, "Division is required"),
    position: z.enum([
        "GK",
        "Central back",
        "Left back",
        "Right back",
        "Defensive midfielder",
        "Offensive midfielder",
        "Right winger",
        "Left winger",
        "Forward",
        "Striker",
    ]),
    agent: z.string().trim().min(1, "Agent is required"),
    country: z.string().min(1, "Country is required"),
    availability: z.enum(["Now", "Soon", "Later"]),
    weight: z.object({
        size: z.number().positive("Weight must be positive"),
        unit: z.enum(["kg", "lb"]),
    }),
    nationalTeamGames: z.string().trim().min(1, "National team games is required"),
    socialMedia: z.string().trim().min(1, "Social media is required"),
    foot: z.enum(["Right", "Left", "Both"]),
    teamsJoined: z.string().trim().min(1, "Teams joined is required"),
    contractExpires: z.string().trim().min(1, "Contract expires is required"),
    videos: z.array(
        z.object({
            title: z.string().trim().min(1, "Video title is required"),
            url: z.url("Invalid URL format"),
        })
    ),
});

const updateAmateurPlayerCanDto = createAmateurPlayerCanDto.partial();

export type TCreateAmateurPlayerCanDto = z.infer<
    typeof createAmateurPlayerCanDto
>;
export type TUpdateAmateurPlayerCanDto = z.infer<
    typeof updateAmateurPlayerCanDto
>;

export const AmateurPlayerCanDto = {
    createAmateurPlayerCanDto,
    updateAmateurPlayerCanDto,
};