import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JobApplyService } from "./jobApply.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

/**
 * Apply to a job
 * POST /api/v1/job-applications/apply
 */
const applyToJob = catchAsync(async (req: Request, res: Response) => {
  const candidateId = req.user?.id;
  const { jobId, resumeUrl } = req.body;

  const result = await JobApplyService.applyToJob(candidateId, jobId, resumeUrl);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Application submitted successfully",
    data: result,
  });
});

/**
 * Get all applications for a specific job
 * GET /api/v1/job-applications/job/:jobId
 * For employers to see all applicants for their job
 */
const getApplicationsByJob = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const result = await JobApplyService.getApplicationsByJob(jobId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Applications retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Get applicant profile details
 * GET /api/v1/job-applications/applicant/:candidateId
 * For employers to view full profile of an applicant
 */
const getApplicantProfile = catchAsync(async (req: Request, res: Response) => {
  const { candidateId } = req.params;
  const result = await JobApplyService.getApplicantProfile(candidateId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Applicant profile retrieved successfully",
    data: result,
  });
});

/**
 * Get candidate's own applications
 * GET /api/v1/job-applications/my-applications
 * For candidates to see jobs they've applied to
 */
const getCandidateApplications = catchAsync(async (req: Request, res: Response) => {
  const candidateId = req.user?.id;
  const result = await JobApplyService.getCandidateApplications(candidateId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Your applications retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Delete/withdraw an application
 * DELETE /api/v1/job-applications/:id
 */
const deleteApplication = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await JobApplyService.deleteApplication(id, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const JobApplyController = {
  applyToJob,
  getApplicationsByJob,
  getApplicantProfile,
  getCandidateApplications,
  deleteApplication,
};
