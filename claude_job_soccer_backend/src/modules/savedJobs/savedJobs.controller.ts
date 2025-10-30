import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SavedJobService } from "./savedJobs.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

/**
 * Add a job to saved jobs
 * POST /api/v1/saved-jobs
 */
const addSavedJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType as "candidate" | "employer";
  const userRole = req.user?.role;
  const { jobId } = req.body;

  const result = await SavedJobService.addSavedJob(
    userId!,
    userType,
    userRole!,
    jobId
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Job saved successfully",
    data: result,
  });
});

/**
 * Remove a job from saved jobs
 * DELETE /api/v1/saved-jobs/:jobId
 */
const removeSavedJob = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { jobId } = req.params;

  await SavedJobService.removeSavedJob(userId!, jobId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Job removed from saved jobs successfully",
    data: null,
  });
});

/**
 * Get all saved jobs for the authenticated user
 * GET /api/v1/saved-jobs
 */
const getSavedJobs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await SavedJobService.getSavedJobs(userId!, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Saved jobs retrieved successfully",
    data: result.data,
    meta: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPages,
      total: result.meta.total,
    },
  });
});

/**
 * Check if a specific job is saved by the authenticated user
 * GET /api/v1/saved-jobs/check/:jobId
 */
const checkIfJobSaved = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { jobId } = req.params;

  const isSaved = await SavedJobService.isJobSaved(userId!, jobId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Job saved status retrieved successfully",
    data: { isSaved },
  });
});

/**
 * Get count of saved jobs for the authenticated user
 * GET /api/v1/saved-jobs/count
 */
const getSavedJobsCount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const count = await SavedJobService.getSavedJobsCount(userId!);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Saved jobs count retrieved successfully",
    data: { count },
  });
});

export const SavedJobController = {
  addSavedJob,
  removeSavedJob,
  getSavedJobs,
  checkIfJobSaved,
  getSavedJobsCount,
};
