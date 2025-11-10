import { model, Schema } from "mongoose";
import { TJobApply } from "./jobApply.interface";

const jobApplySchema = new Schema<TJobApply>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true, // For querying applications by job
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For querying applications by candidate
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    aiMatchPercentage: {
      type: Number,
      min: 0,
      max: 100,
      index: true, // For sorting by match score
    },
    resumeUrl: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // Auto-creates createdAt and updatedAt
    versionKey: false,
  }
);

// ============================================
// COMPOUND INDEXES for Query Optimization
// ============================================

// 1. Prevent duplicate applications (unique constraint)
jobApplySchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// 2. Get all applications for a job, sorted by AI match
jobApplySchema.index({ jobId: 1, isDeleted: 1, aiMatchPercentage: -1 });

// 3. Get all applications for a job, sorted by date
jobApplySchema.index({ jobId: 1, isDeleted: 1, appliedAt: -1 });

// 4. Get candidate's applications
jobApplySchema.index({ candidateId: 1, isDeleted: 1, appliedAt: -1 });

export const JobApply = model<TJobApply>("JobApply", jobApplySchema);
