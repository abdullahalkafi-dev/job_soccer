import { Types } from "mongoose";
import { SavedJob } from "./savesJobs.model";
import { TSavedJob } from "./savedJobs.interface";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { Job } from "../Job/job.model";

/**
 * Add a job to saved jobs
 * Both candidates and employers can save jobs
 */
const addSavedJob = async (
  userId: string,
  userType: "candidate" | "employer",
  userRole: string,
  jobId: string
): Promise<TSavedJob> => {
  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }

  // Check if job is already saved
  const existingSavedJob = await SavedJob.findOne({
    userId: new Types.ObjectId(userId),
    jobId: new Types.ObjectId(jobId),
  });

  if (existingSavedJob) {
    throw new AppError(StatusCodes.CONFLICT, "Job already saved");
  }

  // Create saved job
  const savedJob = await SavedJob.create({
    userId: new Types.ObjectId(userId),
    jobId: new Types.ObjectId(jobId),
    userType,
    userRole,
  });

  // Populate job details before returning
  const populatedSavedJob = await SavedJob.findById(savedJob._id)
    .populate({
      path: "jobId",
      select: "-__v",
    })
    .lean();

  return populatedSavedJob as TSavedJob;
};

/**
 * Remove a job from saved jobs
 */
const removeSavedJob = async (
  userId: string,
  jobId: string
): Promise<void> => {
  const result = await SavedJob.findOneAndDelete({
    userId: new Types.ObjectId(userId),
    jobId: new Types.ObjectId(jobId),
  });

  if (!result) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Saved job not found or already removed"
    );
  }
};

/**
 * Get all saved jobs for a user with pagination
 */
const getSavedJobs = async (
  userId: string,
  query: Record<string, any>
): Promise<{
  data: TSavedJob[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = {
    userId: new Types.ObjectId(userId),
  };

  // Optional filters
  if (query.userType) {
    filter.userType = query.userType;
  }

  if (query.userRole) {
    filter.userRole = query.userRole;
  }

  // Get total count
  const total = await SavedJob.countDocuments(filter);

  // Get saved jobs with populated job details
  const savedJobs = await SavedJob.find(filter)
    .populate({
      path: "jobId",
      select: "-__v",
      match: { status: { $ne: "deleted" } }, // Exclude deleted jobs
    })
    .populate({
      path: "userId",
      select: "firstName lastName email profileImage",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Filter out saved jobs where the job was deleted
  const filteredSavedJobs = savedJobs.filter((savedJob) => savedJob.jobId !== null);

  return {
    data: filteredSavedJobs as TSavedJob[],
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Check if a job is saved by a user
 */
const isJobSaved = async (
  userId: string,
  jobId: string
): Promise<boolean> => {
  const savedJob = await SavedJob.findOne({
    userId: new Types.ObjectId(userId),
    jobId: new Types.ObjectId(jobId),
  });

  return !!savedJob;
};

/**
 * Get saved jobs count for a user
 */
const getSavedJobsCount = async (userId: string): Promise<number> => {
  const count = await SavedJob.countDocuments({
    userId: new Types.ObjectId(userId),
  });

  return count;
};

export const SavedJobService = {
  addSavedJob,
  removeSavedJob,
  getSavedJobs,
  isJobSaved,
  getSavedJobsCount,
};
