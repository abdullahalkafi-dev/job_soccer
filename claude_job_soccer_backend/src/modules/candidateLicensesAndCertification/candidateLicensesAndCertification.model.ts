import { model, Schema } from "mongoose";
import { TCandidateLicenseAndCertification } from "./candidateLicensesAndCertification.interface";

const candidateLicensesAndCertificationSchema = new Schema<TCandidateLicenseAndCertification>(
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
    name: {
      type: String,
      required: true,
    },
    issuingOrganization: {
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
    credentialId: {
      type: String,
      required: false,
    },
    credentialUrl: {
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

// Index for efficiently finding user's license and certification records
candidateLicensesAndCertificationSchema.index({ userId: 1, createdAt: -1 });
// Index for finding licenses and certifications by profile
candidateLicensesAndCertificationSchema.index({ profileId: 1, startYear: -1 });

export const CandidateLicenseAndCertification = model<TCandidateLicenseAndCertification>(
  "CandidateLicenseAndCertification",
  candidateLicensesAndCertificationSchema
);
