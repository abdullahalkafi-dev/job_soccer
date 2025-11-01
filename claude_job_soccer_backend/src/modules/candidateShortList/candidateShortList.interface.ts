import { Types } from "mongoose";
import {
  CandidateRole,
  EmployerRole,
  UserType,
} from "../user/user.interface";

export type TCandidateShortList = {
  candidateId: Types.ObjectId;
  candidateRole: CandidateRole;
  shortlistedById: Types.ObjectId;
  shortlistedByType: UserType.CANDIDATE | UserType.EMPLOYER;
  shortlistedByRole: CandidateRole | EmployerRole;
  createdAt: Date;
  updatedAt: Date;
};
