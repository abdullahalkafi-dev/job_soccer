import { z } from "zod";

const createAcademyEmpDto = z.object({
    clubName: z.string().trim().min(1, "Club name is required"),
    country: z.string().min(1, "Country is required"),
    address: z.string().trim().min(1, "Address is required"),
    founded: z.string().trim().min(1, "Founded is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    position: z.string().trim().min(1, "Position is required"),
    location: z.string().trim().min(1, "Location is required"),
    level: z.string().trim().min(1, "Level is required"),
    website: z.string().trim().min(1, "Website is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required").optional(),
    clubContact: z.string().trim().min(1, "Club contact is required"),
    clubDescription: z.string().trim().min(1, "Club description is required"),
});

const updateAcademyEmpDto = createAcademyEmpDto.partial();

export type TCreateAcademyEmpDto = z.infer<typeof createAcademyEmpDto>;
export type TUpdateAcademyEmpDto = z.infer<typeof updateAcademyEmpDto>;

export const AcademyEmpDto = {
    createAcademyEmpDto,
    updateAcademyEmpDto,
};
