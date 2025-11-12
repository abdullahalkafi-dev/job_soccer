import { z } from "zod";

const createProfessionalClubEmpDto = z.object({
    country: z.string().min(1, "Country is required"),
    address: z.string().trim().min(1, "Address is required"),
    location: z.string().trim().min(1, "Location is required"),
    level: z.string().trim().min(1, "Level is required"),
    founded: z.string().trim().min(1, "Founded is required"),
    website: z.string().trim().min(1, "Website is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required").optional(),
    clubName: z.string().trim().min(1, "Club name is required"),
    clubContact: z.string().trim().min(1, "Club contact is required"),
    clubDescription: z.string().trim().min(1, "Club description is required"),
});

const updateProfessionalClubEmpDto = createProfessionalClubEmpDto.partial();

export type TCreateProfessionalClubEmpDto = z.infer<
    typeof createProfessionalClubEmpDto
>;
export type TUpdateProfessionalClubEmpDto = z.infer<
    typeof updateProfessionalClubEmpDto
>;

export const ProfessionalClubEmpDto = {
    createProfessionalClubEmpDto,
    updateProfessionalClubEmpDto,
};
