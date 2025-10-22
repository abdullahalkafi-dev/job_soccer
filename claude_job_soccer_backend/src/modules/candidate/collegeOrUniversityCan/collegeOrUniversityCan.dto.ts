import { z } from "zod";

const createCollegeOrUniversityCanDto = z.object({
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
    socialMedia: z.string().trim().min(1, "Social media is required"),
    satOrAct: z.string().trim().min(1, "SAT or ACT is required"),
    availability: z.enum(["Now", "Soon", "Later"]),
    weight: z.object({
        size: z.number().positive("Weight must be positive"),
        unit: z.enum(["kg", "lb"]),
    }),
    collegeOrUniversity: z.string().trim().min(1, "College or university is required"),
    foot: z.enum(["Right", "Left", "Both"]),
    league: z.string().trim().min(1, "League is required"),
    schoolName: z.string().trim().min(1, "School name is required"),
    diploma: z.string().trim().min(1, "Diploma is required"),
    gpa: z.string().trim().min(1, "GPA is required"),
    country: z.string().min(1, "Country is required"),
    videos: z.array(
        z.object({
            title: z.string().trim().min(1, "Video title is required"),
            url: z.url("Invalid URL format"),
        })
    ),
});

const updateCollegeOrUniversityCanDto = createCollegeOrUniversityCanDto.partial();

export type TCreateCollegeOrUniversityCanDto = z.infer<
    typeof createCollegeOrUniversityCanDto
>;
export type TUpdateCollegeOrUniversityCanDto = z.infer<
    typeof updateCollegeOrUniversityCanDto
>;

export const CollegeOrUniversityCanDto = {
    createCollegeOrUniversityCanDto,
    updateCollegeOrUniversityCanDto,
};
