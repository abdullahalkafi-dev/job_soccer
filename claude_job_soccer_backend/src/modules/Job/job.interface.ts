import { Types } from "mongoose";
import { CandidateRole, EmployerRole } from "../user/user.interface";

export type ContractType = "FullTime" | "PartTime";
export type JobStatus = "active" | "closed" | "draft" | "expired";

export interface IJob {
  jobTitle: string;
  creator: {
    creatorId: Types.ObjectId;
    creatorRole: EmployerRole;
  };
  location: string;
  deadline: Date;
  jobOverview: string;
  jobCategory: CandidateRole;
  position: string;
  contractType: ContractType;
  status: JobStatus;
  salary: {
    min: number;
    max: number;
  };
  requiredAiScore?: number;
  experience: string;
  requirements: string;
  responsibilities: string;
  requiredSkills: string;
  additionalRequirements?: string;

  country?: string;
  searchKeywords?: string[];
  applicationCount?: number;
  // Timestamps for sorting and filtering
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date; // Auto-set from deadline for easier querying
}
