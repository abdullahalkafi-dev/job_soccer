import { Types } from "mongoose";

export type TJobApply = {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  appliedAt: Date;
  aiMatchPercentage?: number;
  resumeUrl?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
