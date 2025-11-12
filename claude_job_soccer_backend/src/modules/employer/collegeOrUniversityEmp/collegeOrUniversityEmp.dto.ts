import { z } from "zod";

const createCollegeOrUniversityEmpDto = z.object({
    collegeOrUniversityName: z.string().trim().min(1, "College or university name is required"),
    country: z.string().min(1, "Country is required"),
    address: z.string().trim().min(1, "Address is required"),
    founded: z.string().trim().min(1, "Founded is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required").optional(),
    location: z.string().trim().min(1, "Location is required"),
    level: z.string().trim().min(1, "Level is required"),
    website: z.string().trim().min(1, "Website is required"),
    clubContact: z.string().trim().min(1, "Club contact is required"),
    clubDescription: z.string().trim().min(1, "Club description is required"),
});

const updateCollegeOrUniversityEmpDto = createCollegeOrUniversityEmpDto.partial();

export type TCreateCollegeOrUniversityEmpDto = z.infer<
    typeof createCollegeOrUniversityEmpDto
>;
export type TUpdateCollegeOrUniversityEmpDto = z.infer<
    typeof updateCollegeOrUniversityEmpDto
>;

export const CollegeOrUniversityEmpDto = {
    createCollegeOrUniversityEmpDto,
    updateCollegeOrUniversityEmpDto,
};
