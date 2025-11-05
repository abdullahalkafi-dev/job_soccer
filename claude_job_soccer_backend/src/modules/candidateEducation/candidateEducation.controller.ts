import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CandidateEducationService } from "./candidateEducation.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import AppError from "../../errors/AppError";

/**
 * Add a new education record for a candidate
 * POST /api/v1/candidate-education
 */
const addEducation = catchAsync(async (req: Request, res: Response) => {
  const educationData = req.body;
  
  // Extract userId from authenticated user token
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User authentication required");
  }

  const result = await CandidateEducationService.addEducation(userId, educationData);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Education record added successfully",
    data: result,
  });
});

/**
 * Update an existing education record
 * PATCH /api/v1/candidate-education/:educationId
 */
const updateEducation = catchAsync(async (req: Request, res: Response) => {
  const { educationId } = req.params;
  const updateData = req.body;

  // Extract userId from auth middleware (assuming it's in req.user)
  const userId = (req as any).user?.userId || updateData.userId;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  const result = await CandidateEducationService.updateEducation(
    educationId,
    userId,
    updateData
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Education record updated successfully",
    data: result,
  });
});

/**
 * Remove a specific education record
 * DELETE /api/v1/candidate-education/:educationId
 */
const removeEducation = catchAsync(async (req: Request, res: Response) => {
  const { educationId } = req.params;

  // Extract userId from auth middleware
  const userId = (req as any).user?.userId;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  await CandidateEducationService.removeEducation(educationId, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Education record deleted successfully",
    data: null,
  });
});

/**
 * Get all education records for a user
 * GET /api/v1/candidate-education/user/:userId
 */
const getAllEducationsByUser = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const result = await CandidateEducationService.getAllEducationsByUser(
      userId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Education records retrieved successfully",
      data: result,
    });
  }
);

/**
 * Get a specific education record by ID
 * GET /api/v1/candidate-education/:educationId
 */
const getEducationById = catchAsync(async (req: Request, res: Response) => {
  const { educationId } = req.params;

  const result = await CandidateEducationService.getEducationById(educationId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Education record retrieved successfully",
    data: result,
  });
});

/**
 * Get education records for multiple users (bulk)
 * POST /api/v1/candidate-education/bulk
 */
const getEducationsByUsers = catchAsync(async (req: Request, res: Response) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "userIds array is required and must not be empty"
    );
  }

  const result = await CandidateEducationService.getEducationsByUsers(userIds);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Education records retrieved successfully",
    data: result,
  });
});

export const CandidateEducationController = {
  addEducation,
  updateEducation,
  removeEducation,
  getAllEducationsByUser,
  getEducationById,
  getEducationsByUsers,
};
