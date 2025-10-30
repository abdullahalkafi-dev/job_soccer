import { Types } from "mongoose";
import { CandidateRole, EmployerRole } from "../user/user.interface";

export type TFriendList = {
  senderId: Types.ObjectId;
  senderType: "candidate" | "employer";
  senderRole: CandidateRole | EmployerRole;
  receiverId: Types.ObjectId; // Must be a candidate
  receiverRole: CandidateRole; // Only candidate roles
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
};
