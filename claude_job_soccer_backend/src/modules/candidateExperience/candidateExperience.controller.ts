import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CandidateExperienceService } from "./candidateExperience.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import AppError from "../../errors/AppError";

/**
 * Add a new experience record for a candidate
 * POST /api/v1/candidate-experience
 */
const addExperience = catchAsync(async (req: Request, res: Response) => {
  const experienceData = req.body;
  
  // Extract userId from authenticated user token
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User authentication required");
  }

  const result = await CandidateExperienceService.addExperience(userId, experienceData);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Experience record added successfully",
    data: result,
  });
});

/**
 * Update an existing experience record
 * PATCH /api/v1/candidate-experience/:experienceId
 */
const updateExperience = catchAsync(async (req: Request, res: Response) => {
  const { experienceId } = req.params;
  const updateData = req.body;

  // Extract userId from auth middleware (assuming it's in req.user)
  const userId = (req as any).user?.id || updateData.userId;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  const result = await CandidateExperienceService.updateExperience(
    experienceId,
    userId,
    updateData
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Experience record updated successfully",
    data: result,
  });
});

/**
 * Remove a specific experience record
 * DELETE /api/v1/candidate-experience/:experienceId
 */
const removeExperience = catchAsync(async (req: Request, res: Response) => {
  const { experienceId } = req.params;

  // Extract userId from auth middleware
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  await CandidateExperienceService.removeExperience(experienceId, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Experience record deleted successfully",
    data: null,
  });
});

/**
 * Get all experience records for a user
 * GET /api/v1/candidate-experience/user/:userId
 */
const getAllExperiencesByUser = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const result = await CandidateExperienceService.getAllExperiencesByUser(
      userId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Experience records retrieved successfully",
      data: result,
    });
  }
);

/**
 * Get a specific experience record by ID
 * GET /api/v1/candidate-experience/:experienceId
 */
const getExperienceById = catchAsync(async (req: Request, res: Response) => {
  const { experienceId } = req.params;

  const result = await CandidateExperienceService.getExperienceById(experienceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Experience record retrieved successfully",
    data: result,
  });
});

/**
 * Get experience records for multiple users (bulk)
 * POST /api/v1/candidate-experience/bulk
 */
const getExperiencesByUsers = catchAsync(async (req: Request, res: Response) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "userIds array is required and must not be empty"
    );
  }

  const result = await CandidateExperienceService.getExperiencesByUsers(userIds);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Experience records retrieved successfully",
    data: result,
  });
});

/**
 * Get experience records by profileId
 * GET /api/v1/candidate-experience/profile/:profileId
 */
const getExperiencesByProfileId = catchAsync(
  async (req: Request, res: Response) => {
    const { profileId } = req.params;

    const result = await CandidateExperienceService.getExperiencesByProfileId(
      profileId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Experience records retrieved successfully",
      data: result,
    });
  }
);

export const CandidateExperienceController = {
  addExperience,
  updateExperience,
  removeExperience,
  getAllExperiencesByUser,
  getExperienceById,
  getExperiencesByUsers,
  getExperiencesByProfileId,
};
