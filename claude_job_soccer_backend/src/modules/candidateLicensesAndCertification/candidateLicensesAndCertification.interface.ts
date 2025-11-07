import { Types } from "mongoose";
import { TMonth } from "../../shared/constant/month.constant";

export type TCandidateLicenseAndCertification = {
  _id?: Types.ObjectId;
  userId: string; // User._id from User collection
  profileId: string; // The actual candidate profile ID
  candidateRole: string;
  name: string;
  issuingOrganization: string;
  startMonth: TMonth;
  startYear: number;
  endMonth?: TMonth;
  endYear?: number;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
