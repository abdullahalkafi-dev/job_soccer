import { model, Schema } from "mongoose";
import { TSavedJob } from "./savedJobs.interface";

const savedJobSchema = new Schema<TSavedJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["candidate", "employer"],
      required: true,
    },
    userRole: {
      type: String,
      required: true,
      index: true,
    },
    
  },
  { timestamps: true, versionKey: false }
);
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
export const SavedJob = model<TSavedJob>("SavedJob", savedJobSchema);
