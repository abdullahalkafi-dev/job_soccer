import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CandidateLicensesAndCertificationService } from "./candidateLicensesAndCertification.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import AppError from "../../errors/AppError";

/**
 * Add a new license and certification record for a candidate
 * POST /api/v1/candidate-licenses-and-certifications
 */
const addLicenseAndCertification = catchAsync(async (req: Request, res: Response) => {
  const licenseData = req.body;
  
  // Extract userId from authenticated user token
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User authentication required");
  }

  const result = await CandidateLicensesAndCertificationService.addLicenseAndCertification(userId, licenseData);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "License and certification record added successfully",
    data: result,
  });
});

/**
 * Update an existing license and certification record
 * PATCH /api/v1/candidate-licenses-and-certifications/:licenseId
 */
const updateLicenseAndCertification = catchAsync(async (req: Request, res: Response) => {
  const { licenseId } = req.params;
  const updateData = req.body;

  // Extract userId from auth middleware (assuming it's in req.user)
  const userId = (req as any).user?.id || updateData.userId;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  const result = await CandidateLicensesAndCertificationService.updateLicenseAndCertification(
    licenseId,
    userId,
    updateData
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "License and certification record updated successfully",
    data: result,
  });
});

/**
 * Remove a specific license and certification record
 * DELETE /api/v1/candidate-licenses-and-certifications/:licenseId
 */
const removeLicenseAndCertification = catchAsync(async (req: Request, res: Response) => {
  const { licenseId } = req.params;

  // Extract userId from auth middleware
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  await CandidateLicensesAndCertificationService.removeLicenseAndCertification(licenseId, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "License and certification record deleted successfully",
    data: null,
  });
});

/**
 * Get all license and certification records for a user
 * GET /api/v1/candidate-licenses-and-certifications/user/:userId
 */
const getAllLicensesAndCertificationsByUser = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const result = await CandidateLicensesAndCertificationService.getAllLicensesAndCertificationsByUser(
      userId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "License and certification records retrieved successfully",
      data: result,
    });
  }
);

/**
 * Get a specific license and certification record by ID
 * GET /api/v1/candidate-licenses-and-certifications/:licenseId
 */
const getLicenseAndCertificationById = catchAsync(async (req: Request, res: Response) => {
  const { licenseId } = req.params;

  const result = await CandidateLicensesAndCertificationService.getLicenseAndCertificationById(licenseId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "License and certification record retrieved successfully",
    data: result,
  });
});

/**
 * Get license and certification records for multiple users (bulk)
 * POST /api/v1/candidate-licenses-and-certifications/bulk
 */
const getLicensesAndCertificationsByUsers = catchAsync(async (req: Request, res: Response) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "userIds array is required and must not be empty"
    );
  }

  const result = await CandidateLicensesAndCertificationService.getLicensesAndCertificationsByUsers(userIds);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "License and certification records retrieved successfully",
    data: result,
  });
});

export const CandidateLicensesAndCertificationController = {
  addLicenseAndCertification,
  updateLicenseAndCertification,
  removeLicenseAndCertification,
  getAllLicensesAndCertificationsByUser,
  getLicenseAndCertificationById,
  getLicensesAndCertificationsByUsers,
};
