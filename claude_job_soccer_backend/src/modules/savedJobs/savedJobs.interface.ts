import { Types } from "mongoose";
import { CandidateRole, EmployerRole } from "../user/user.interface";

export type TSavedJob = {
  userId:Types.ObjectId;
  userType: "candidate" | "employer";
  userRole: CandidateRole | EmployerRole;
  jobId: Types.ObjectId;
  createdAt: Date;
};
