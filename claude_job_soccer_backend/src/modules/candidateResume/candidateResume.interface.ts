import { Types } from "mongoose";

export type TCandidateResume = {
  _id?: Types.ObjectId;
  userId: string; // User._id from User collection
  profileId: string; // The actual candidate profile ID
  candidateRole: string;
  resumeFileName: string;
  resumeUrl: string;
  isActive: boolean; // Mark which resume is currently active/primary
  createdAt?: Date;
  updatedAt?: Date;
};
