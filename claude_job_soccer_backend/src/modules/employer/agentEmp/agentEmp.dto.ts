import { z } from "zod";

const createAgentEmpDto = z.object({
    companyName: z.string().trim().min(1, "Company name is required"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    country: z.string().min(1, "Country is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    socialMedia: z.string().trim().min(1, "Social media is required"),
    website: z.string().trim().min(1, "Website is required"),
    fifaLicenseNumber: z.string().trim().min(1, "FIFA license number is required"),
});

const updateAgentEmpDto = createAgentEmpDto.partial();

export type TCreateAgentEmpDto = z.infer<typeof createAgentEmpDto>;
export type TUpdateAgentEmpDto = z.infer<typeof updateAgentEmpDto>;

export const AgentEmpDto = {
    createAgentEmpDto,
    updateAgentEmpDto,
};
