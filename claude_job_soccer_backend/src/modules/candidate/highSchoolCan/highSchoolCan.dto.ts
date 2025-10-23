import { z } from "zod";

const createHighSchoolCanDto = z.object({
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
    gender: z.string().trim().min(1, "Gender is required"),
    height: z.object({
        size: z.number().positive("Height must be positive"),
        unit: z.enum(["cm", "m", "in", "ft"]),
    }),
    currentClub: z.string().trim().min(1, "Current club is required"),
    category: z.string().trim().min(1, "Category is required"),
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
    satOrAct: z.string().trim().min(1, "SAT or ACT is required"),
    availability: z.enum(["Now", "Soon", "Later"]),
    weight: z.object({
        size: z.number().positive("Weight must be positive"),
        unit: z.enum(["kg", "lb"]),
    }),
    socialMedia: z.string().trim().min(1, "Social media is required"),
    foot: z.enum(["Right", "Left", "Both"]),
    league: z.string().trim().min(1, "League is required"),
    schoolName: z.string().trim().min(1, "School name is required"),
    gpa: z.string().trim().min(1, "GPA is required"),
    country: z.string().min(1, "Country is required"),
    videos: z.array(
        z.object({
            title: z.string().trim().min(1, "Video title is required"),
            url: z.url("Invalid URL format"),
        })
    ),
});

const updateHighSchoolCanDto = createHighSchoolCanDto.partial();

export type TCreateHighSchoolCanDto = z.infer<typeof createHighSchoolCanDto>;
export type TUpdateHighSchoolCanDto = z.infer<typeof updateHighSchoolCanDto>;

export const HighSchoolCanDto = {
    createHighSchoolCanDto,
    updateHighSchoolCanDto,
};
