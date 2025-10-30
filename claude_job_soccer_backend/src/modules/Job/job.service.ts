import { Job } from "./job.model";
import { IJob, JobStatus } from "./job.interface";
import { QueryBuilder } from "../../shared/builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import { SearchHistoryService, SearchEntityType } from "../searchHistory/searchHistory.service";


/**
 * Create a new job posting
 */
const createJob = async (jobData: Partial<IJob>): Promise<IJob> => {
  const job = await Job.create(jobData);
  return job.toObject();
};

/**
 * Get all jobs with advanced filtering, searching, and pagination
 * OPTIMIZED: Uses text index for search, compound indexes for filters
 */
const getAllJobs = async (query: Record<string, any>) => {
  // Track search term for history if provided
  if (query.searchTerm && typeof query.searchTerm === 'string') {
    // Don't await - fire and forget to avoid slowing down the query
    SearchHistoryService.recordSearch(SearchEntityType.JOB, query.searchTerm).catch(err => 
      console.error('Failed to record search history:', err)
    );
  }

  // Build base query object
  const queryFilter: any = {};

  // Use text search if searchTerm is provided (FAST - uses text index)
  if (query.searchTerm) {
    queryFilter.$text = { $search: query.searchTerm };
  }

  // Status filter (default to active) - IMPORTANT: Put this first for index usage
  queryFilter.status = query.status || "active";

  // Apply filterable fields in order of index importance
  if (query.jobCategory) queryFilter.jobCategory = query.jobCategory;
  if (query.location) queryFilter.location = new RegExp(query.location, "i");
  if (query.country) queryFilter.country = query.country;
  if (query.contractType) queryFilter.contractType = query.contractType;
  if (query.position) queryFilter.position = query.position;
  if (query.creatorId) queryFilter["creator.creatorId"] = query.creatorId;
  if (query["creator.creatorRole"]) queryFilter["creator.creatorRole"] = query["creator.creatorRole"];

  // Salary range filters
  if (query.minSalary) {
    queryFilter["salary.min"] = { $gte: Number(query.minSalary) };
  }
  if (query.maxSalary) {
    queryFilter["salary.max"] = { $lte: Number(query.maxSalary) };
  }

  // AI Score range filters
  if (query.minRequiredAiScore) {
    queryFilter.requiredAiScore = { 
      ...queryFilter.requiredAiScore, 
      $gte: Number(query.minRequiredAiScore) 
    };
  }
  if (query.maxRequiredAiScore) {
    queryFilter.requiredAiScore = { 
      ...queryFilter.requiredAiScore, 
      $lte: Number(query.maxRequiredAiScore) 
    };
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 9999;
  const skip = (page - 1) * limit;

  // Sorting
  let sortBy: any = { createdAt: -1 }; // Default sort
  if (query.sortBy) {
    const sortField = query.sortBy.startsWith('-') 
      ? query.sortBy.substring(1) 
      : query.sortBy;
    const sortOrder = query.sortBy.startsWith('-') ? -1 : 1;
    sortBy = { [sortField]: sortOrder };
  } else if (query.searchTerm) {
    // Sort by text relevance score when searching
    sortBy = { score: { $meta: "textScore" } };
  }

  // Build the query with projection for text score if needed
  let selectFields: any = {};
  if (query.searchTerm) {
    selectFields.score = { $meta: "textScore" };
  }

  // Execute queries in parallel for better performance
  const [jobs, total] = await Promise.all([
    Job.find(queryFilter)
      .select(selectFields)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate("creator.creatorId", "firstName lastName email profileImage role")
      .lean()
      .exec(),
    Job.countDocuments(queryFilter).exec(),
  ]);

  return {
    data: jobs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get active jobs only (most common query)
 * OPTIMIZED: Uses status index as first filter
 */
const getActiveJobs = async (filters: {
  jobCategory?: string;
  location?: string;
  country?: string;
  contractType?: string;
  minSalary?: number;
  maxSalary?: number;
  minRequiredAiScore?: number;
  maxRequiredAiScore?: number;
  employerRole?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}) => {
  const {
    jobCategory,
    location,
    country,
    contractType,
    minSalary,
    maxSalary,
    minRequiredAiScore,
    maxRequiredAiScore,
    employerRole,
    page = 1,
    limit = 20,
    sortBy = "-createdAt",
  } = filters;

  const queryFilter: any = { status: "active" };

  // Build query filters (order matters for index usage)
  if (jobCategory) queryFilter.jobCategory = jobCategory;
  if (location) queryFilter.location = new RegExp(location, "i");
  if (country) queryFilter.country = country;
  if (contractType) queryFilter.contractType = contractType;
  if (employerRole) queryFilter["creator.creatorRole"] = employerRole;

  // Salary range filtering
  if (minSalary !== undefined) {
    queryFilter["salary.min"] = { $gte: minSalary };
  }
  if (maxSalary !== undefined) {
    queryFilter["salary.max"] = { $lte: maxSalary };
  }

  // Required AI Score range filtering
  if (minRequiredAiScore !== undefined) {
    queryFilter["requiredAiScore"] = { ...queryFilter["requiredAiScore"], $gte: minRequiredAiScore };
  }
  if (maxRequiredAiScore !== undefined) {
    queryFilter["requiredAiScore"] = { ...queryFilter["requiredAiScore"], $lte: maxRequiredAiScore };
  }

  const skip = (page - 1) * limit;

  // Parallel execution for better performance
  const [jobs, total] = await Promise.all([
    Job.find(queryFilter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate("creator.creatorId", "firstName lastName email profileImage")
      .lean(),
    Job.countDocuments(queryFilter),
  ]);

  return {
    data: jobs,
    meta: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      limit,
    },
  };
};

/**
 * Get single job by ID
 * OPTIMIZED: Uses _id index (default)
 */
const getJobById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job ID");
  }

  const job = await Job.findById(id)
    .populate("creator.creatorId", "firstName lastName email profileImage role")
    .lean();

  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }

  return job;
};

/**
 * Get all jobs posted by a specific employer
 * OPTIMIZED: Uses compound index { "creator.creatorId": 1, status: 1, createdAt: -1 }
 */
const getJobsByEmployer = async (employerId: string, status?: JobStatus) => {
  if (!Types.ObjectId.isValid(employerId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid employer ID");
  }

  const queryFilter: any = { "creator.creatorId": employerId };
  if (status) queryFilter.status = status;

  const jobs = await Job.find(queryFilter)
    .sort("-createdAt")
    .select("-searchKeywords") // Exclude internal fields
    .lean();

  return {
    data: jobs,
    meta: {
      total: jobs.length,
      employerId,
    },
  };
};

/**
 * Get trending/popular jobs
 * OPTIMIZED: Uses compound index { status: 1, applicationCount: -1, createdAt: -1 }
 */
const getTrendingJobs = async (limit: number = 10) => {
  const jobs = await Job.find({ status: "active" })
    .sort({ applicationCount: -1, createdAt: -1 })
    .limit(limit)
    .populate("creator.creatorId", "firstName lastName email profileImage")
    .select("-searchKeywords")
    .lean();

  return {
    data: jobs,
    meta: {
      total: jobs.length,
      type: "trending",
    },
  };
};

/**
 * Get jobs expiring soon
 * OPTIMIZED: Uses compound index { status: 1, deadline: 1 }
 */
const getExpiringJobs = async (daysAhead: number = 7) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  const jobs = await Job.find({
    status: "active",
    deadline: {
      $gte: today,
      $lte: futureDate,
    },
  })
    .sort({ deadline: 1 })
    .populate("creator.creatorId", "firstName lastName email profileImage")
    .select("-searchKeywords")
    .lean();

  return {
    data: jobs,
    meta: {
      total: jobs.length,
      expiringWithinDays: daysAhead,
    },
  };
};

/**
 * Update job
 * Validates ownership if employerId is provided
 */
const updateJob = async (
  jobId: string,
  updateData: Partial<IJob>,
  employerId?: string
) => {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job ID");
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }

  // Verify ownership if employerId is provided
  if (employerId && job.creator.creatorId.toString() !== employerId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this job"
    );
  }

  // Update job
  Object.assign(job, updateData);
  await job.save(); // This triggers pre-save middleware

  return job.toObject();
};

/**
 * Delete job (soft delete by changing status)
 * OPTIMIZED: Uses updateOne instead of findAndUpdate
 */
const deleteJob = async (jobId: string, employerId?: string) => {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job ID");
  }

  const job = await Job.findById(jobId).select("creator").lean();

  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }

  // Verify ownership
  if (employerId && job.creator.creatorId.toString() !== employerId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this job"
    );
  }

  // Soft delete - change status to closed
  await Job.updateOne({ _id: jobId }, { status: "closed" });

  return { message: "Job deleted successfully" };
};

/**
 * Increment application count
 * OPTIMIZED: Atomic update without fetching document
 */
const incrementApplicationCount = async (jobId: string) => {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job ID");
  }

  const result = await Job.updateOne(
    { _id: jobId },
    { $inc: { applicationCount: 1 } }
  );

  if (result.matchedCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }

  return { message: "Application count updated" };
};

/**
 * Get jobs by multiple categories (for candidate recommendations)
 * OPTIMIZED: Uses $in operator with jobCategory index
 */
const getJobsByCategories = async (categories: string[], limit: number = 20) => {
  const jobs = await Job.find({
    status: "active",
    jobCategory: { $in: categories },
  })
    .sort("-createdAt")
    .limit(limit)
    .populate("creator.creatorId", "firstName lastName email profileImage")
    .select("-searchKeywords")
    .lean();

  return {
    data: jobs,
    meta: {
      total: jobs.length,
      categories,
    },
  };
};

/**
 * Get job statistics for employer dashboard
 * OPTIMIZED: Uses aggregation pipeline with indexes
 */
const getEmployerJobStats = async (employerId: string) => {
  if (!Types.ObjectId.isValid(employerId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid employer ID");
  }

  const stats = await Job.aggregate([
    {
      $match: { "creator.creatorId": new Types.ObjectId(employerId) },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalApplications: { $sum: "$applicationCount" },
      },
    },
  ]);

  return {
    data: stats,
    meta: {
      employerId,
    },
  };
};

/**
 * Bulk update job status (for admin or automated tasks)
 * OPTIMIZED: Uses updateMany for batch operations
 */
const bulkUpdateStatus = async (jobIds: string[], newStatus: JobStatus) => {
  const objectIds = jobIds.map((id) => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(StatusCodes.BAD_REQUEST, `Invalid job ID: ${id}`);
    }
    return new Types.ObjectId(id);
  });

  const result = await Job.updateMany(
    { _id: { $in: objectIds } },
    { status: newStatus }
  );

  return {
    message: "Jobs updated successfully",
    modifiedCount: result.modifiedCount,
  };
};

/**
 * Auto-expire jobs past deadline
 * OPTIMIZED: Batch update using updateMany
 * Should be run as a cron job
 */
const expireOldJobs = async () => {
  const result = await Job.updateMany(
    {
      status: "active",
      deadline: { $lt: new Date() },
    },
    {
      status: "expired",
    }
  );

  return {
    message: "Expired jobs updated",
    count: result.modifiedCount,
  };
};

// Export all service functions
export const JobService = {
  createJob,
  getAllJobs,
  getActiveJobs,
  getJobById,
  getJobsByEmployer,
  getTrendingJobs,
  getExpiringJobs,
  updateJob,
  deleteJob,
  incrementApplicationCount,
  getJobsByCategories,
  getEmployerJobStats,
  bulkUpdateStatus,
  expireOldJobs,
};

