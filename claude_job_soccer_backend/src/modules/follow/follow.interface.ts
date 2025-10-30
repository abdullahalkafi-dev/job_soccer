import { Types } from "mongoose";
import { CandidateRole, EmployerRole } from "../user/user.interface";

export type TFollow = {
  followerId: Types.ObjectId;
  followerType: "candidate" | "employer";
  followerRole: CandidateRole | EmployerRole;
  followingId: Types.ObjectId; 
  followingRole: EmployerRole;
  createdAt: Date;
};
