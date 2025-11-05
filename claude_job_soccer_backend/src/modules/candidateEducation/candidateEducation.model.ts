import { model, Schema } from "mongoose";
import { TCandidateEducation } from "./candidateEducation.interface";

const candidateEducationSchema = new Schema<TCandidateEducation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    profileId: {
      type: String,
      required: true,
      index: true,
    },
    candidateRole: {
      type: String,
      required: true,
      index: true,
    },
    instituteName: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    startMonth: {
      type: String,
      required: true,
    },
    startYear: {
      type: Number,
      required: true,
    },
    endMonth: {
      type: String,
      required: false,
    },
    endYear: {
      type: Number,
      required: false,
    },
    grade: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// Index for efficiently finding user's education records
candidateEducationSchema.index({ userId: 1, createdAt: -1 });
// Index for finding education by profile
candidateEducationSchema.index({ profileId: 1, startYear: -1 });

export const CandidateEducation = model<TCandidateEducation>(
  "CandidateEducation",
  candidateEducationSchema
);
