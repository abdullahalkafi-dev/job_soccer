import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { FollowService } from "./follow.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

/**
 * Follow an employer
 * POST /api/v1/follow
 */
const followEmployer = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user?.id;
  const followerType = req.user?.userType as "candidate" | "employer";
  const followerRole = req.user?.role;
  const { employerId } = req.body;

  const result = await FollowService.followEmployer(
    followerId!,
    followerType,
    followerRole!,
    employerId
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Employer followed successfully",
    data: result,
  });
});

/**
 * Unfollow an employer
 * DELETE /api/v1/follow/:employerId
 */
const unfollowEmployer = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user?.id;
  const { employerId } = req.params;

  await FollowService.unfollowEmployer(followerId!, employerId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employer unfollowed successfully",
    data: null,
  });
});

/**
 * Get all employers that the authenticated user is following
 * GET /api/v1/follow/following
 */
const getFollowing = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await FollowService.getFollowing(userId!, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Following list retrieved successfully",
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
 * Get all followers of a specific employer
 * GET /api/v1/follow/followers/:employerId
 */
const getFollowers = catchAsync(async (req: Request, res: Response) => {
  const { employerId } = req.params;

  const result = await FollowService.getFollowers(employerId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Followers list retrieved successfully",
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
 * Check if the authenticated user is following a specific employer
 * GET /api/v1/follow/check/:employerId
 */
const checkIfFollowing = catchAsync(async (req: Request, res: Response) => {
  const followerId = req.user?.id;
  const { employerId } = req.params;

  const isFollowing = await FollowService.isFollowing(followerId!, employerId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Follow status retrieved successfully",
    data: { isFollowing },
  });
});

/**
 * Get count of employers that the authenticated user is following
 * GET /api/v1/follow/following/count
 */
const getFollowingCount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const count = await FollowService.getFollowingCount(userId!);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Following count retrieved successfully",
    data: { count },
  });
});

/**
 * Get count of followers for a specific employer
 * GET /api/v1/follow/followers/:employerId/count
 */
const getFollowersCount = catchAsync(async (req: Request, res: Response) => {
  const { employerId } = req.params;

  const count = await FollowService.getFollowersCount(employerId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Followers count retrieved successfully",
    data: { count },
  });
});

export const FollowController = {
  followEmployer,
  unfollowEmployer,
  getFollowing,
  getFollowers,
  checkIfFollowing,
  getFollowingCount,
  getFollowersCount,
};
