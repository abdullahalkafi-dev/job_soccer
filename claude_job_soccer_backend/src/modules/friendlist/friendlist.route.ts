import express, { Router } from "express";
import { FriendListController } from "./friendlist.controller";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";
import {
  sendFriendRequestSchema,
  respondToFriendRequestSchema,
  removeFriendSchema,
} from "./friendlist.dto";
import { UserType } from "../user/user.interface";

const router: Router = express.Router();

/**
 * @route   POST /api/v1/friendlist
 * @desc    Send a friend request
 * @access  Private (Candidate & Employer)
 */
router.post(
  "/",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  validateRequest(sendFriendRequestSchema),
  FriendListController.sendFriendRequest
);

/**
 * @route   GET /api/v1/friendlist/friends
 * @desc    Get all friends of the authenticated user
 * @access  Private (Candidate & Employer)
 * @query   page, limit
 */
router.get(
  "/friends",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  FriendListController.getFriends
);

/**
 * @route   GET /api/v1/friendlist/friends/count
 * @desc    Get friends count
 * @access  Private (Candidate & Employer)
 */
router.get(
  "/friends/count",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  FriendListController.getFriendsCount
);

/**
 * @route   DELETE /api/v1/friendlist/friends/:friendId
 * @desc    Remove a friend
 * @access  Private (Candidate & Employer)
 */
router.delete(
  "/friends/:friendId",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  validateRequest(removeFriendSchema),
  FriendListController.removeFriend
);

/**
 * @route   GET /api/v1/friendlist/received
 * @desc    Get all friend requests received by the authenticated user
 * @access  Private (Candidate & Employer)
 * @query   page, limit
 */
router.get(
  "/received",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  FriendListController.getReceivedFriendRequests
);

/**
 * @route   GET /api/v1/friendlist/received/count
 * @desc    Get pending requests count
 * @access  Private (Candidate & Employer)
 */
router.get(
  "/received/count",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  FriendListController.getPendingRequestsCount
);

/**
 * @route   GET /api/v1/friendlist/sent
 * @desc    Get all friend requests sent by the authenticated user
 * @access  Private (Candidate & Employer)
 * @query   page, limit
 */
router.get(
  "/sent",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  FriendListController.getSentFriendRequests
);

/**
 * @route   PATCH /api/v1/friendlist/:requestId
 * @desc    Respond to a friend request (accept or reject)
 * @access  Private (Candidate & Employer)
 */
router.patch(
  "/:requestId",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  validateRequest(respondToFriendRequestSchema),
  FriendListController.respondToFriendRequest
);

/**
 * @route   DELETE /api/v1/friendlist/:requestId
 * @desc    Cancel a sent friend request
 * @access  Private (Candidate & Employer)
 */
router.delete(
  "/:requestId",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  FriendListController.cancelFriendRequest
);

/**
 * @route   GET /api/v1/friendlist/check/:userId
 * @desc    Check friendship status with another user
 * @access  Private (Candidate & Employer)
 */
router.get(
  "/check/:userId",
  auth(UserType.CANDIDATE, UserType.EMPLOYER),
  FriendListController.checkFriendship
);

export const FriendListRoutes = router;
