import { z } from "zod";

const createAmateurClubEmpDto = z.object({
    clubName: z.string().trim().min(1, "Club name is required"),
    country: z.string().min(1, "Country is required"),
    address: z.string().trim().min(1, "Address is required"),
    founded: z.string().trim().min(1, "Founded is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    position: z.string().trim().min(1, "Position is required"),
    location: z.string().trim().min(1, "Location is required"),
    level: z.string().trim().min(1, "Level is required"),
    website: z.string().trim().min(1, "Website is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    clubContact: z.string().trim().min(1, "Club contact is required"),
    clubDescription: z.string().trim().min(1, "Club description is required"),
});

const updateAmateurClubEmpDto = createAmateurClubEmpDto.partial();

export type TCreateAmateurClubEmpDto = z.infer<typeof createAmateurClubEmpDto>;
export type TUpdateAmateurClubEmpDto = z.infer<typeof updateAmateurClubEmpDto>;

export const AmateurClubEmpDto = {
    createAmateurClubEmpDto,
    updateAmateurClubEmpDto,
};
