import { Types } from "mongoose";
import { TMonth } from "../../shared/constant/month.constant";

export type TCandidateEducation = {
  _id?: Types.ObjectId;
  userId: string; // User._id from User collection
  profileId: string; // The actual candidate profile ID
  candidateRole: string;
  instituteName: string;
  degree: string;
  fieldOfStudy: string;
  startMonth: TMonth;
  startYear: number;
  endMonth?: TMonth;
  endYear?: number;
  grade?: string; // Optional as grading systems vary
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
