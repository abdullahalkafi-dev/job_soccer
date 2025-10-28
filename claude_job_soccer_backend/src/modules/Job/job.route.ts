import express, { Router } from "express";
import { JobController } from "./job.controller";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";
import { JobValidation } from "./job.dto";
import { UserType } from "../user/user.interface";

const router = express.Router();

/**
 * PUBLIC ROUTES
 */

/**
 * GET /api/v1/jobs
 * Get all jobs with advanced filtering and pagination
 * Query params:
 *   - searchTerm: string (search in title, position, location, overview)
 *   - jobCategory: string (candidate role)
 *   - location: string
 *   - country: string
 *   - contractType: "FullTime" | "PartTime"
 *   - minSalary: number
 *   - maxSalary: number
 *   - status: "active" | "closed" | "draft" | "expired"
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - sortBy: string (default: -createdAt)
 */
router.get(
  "/",
  validateRequest(JobValidation.getAllJobsDto),
  JobController.getAllJobs
);

/**
 * GET /api/v1/jobs/active
 * Get only active jobs with filters
 */
router.get("/active", JobController.getActiveJobs);

/**
 * GET /api/v1/jobs/search
 * Full-text search across jobs
 * Query params:
 *   - searchTerm: string (required)
 *   - jobCategory: string (optional filter)
 *   - location: string (optional filter)
 *   - contractType: "FullTime" | "PartTime" (optional filter)
 */
router.get(
  "/search",
  validateRequest(JobValidation.searchJobsDto),
  JobController.searchJobs
);

/**
 * GET /api/v1/jobs/trending
 * Get trending/popular jobs based on application count
 * Query params:
 *   - limit: number (default: 10)
 */
router.get("/trending", JobController.getTrendingJobs);

/**
 * GET /api/v1/jobs/expiring
 * Get jobs expiring soon
 * Query params:
 *   - days: number (default: 7) - look ahead this many days
 */
router.get("/expiring", JobController.getExpiringJobs);

/**
 * GET /api/v1/jobs/my/jobs
 * Get jobs created by the authenticated user
 * Query params:
 *   - status: "active" | "closed" | "draft" | "expired" (optional)
 */
router.get("/my/jobs", auth(UserType.EMPLOYER), JobController.getMyJobs);

/**
 * GET /api/v1/jobs/my/stats
 * Get job statistics for the authenticated user
 */
router.get("/my/stats", auth(UserType.EMPLOYER), JobController.getMyJobStats);

/**
 * GET /api/v1/jobs/employer/:employerId
 * Get all jobs posted by a specific employer
 * Query params:
 *   - status: "active" | "closed" | "draft" | "expired" (optional)
 */
router.get("/employer/:employerId", JobController.getJobsByEmployer);

/**
 * GET /api/v1/jobs/stats/employer/:employerId
 * Get job statistics for a specific employer
 */
router.get("/stats/employer/:employerId", JobController.getEmployerJobStats);

/**
 * GET /api/v1/jobs/:id
 * Get a single job by ID
 */
router.get("/:id", JobController.getJobById);

/**
 * PROTECTED ROUTES - Require authentication
 */

/**
 * POST /api/v1/jobs
 * Create a new job posting (Employer only)
 */
router.post(
  "/",
  auth(UserType.EMPLOYER),
  validateRequest(JobValidation.createJobDto),
  JobController.createJob
);

/**
 * POST /api/v1/jobs/by-categories
 * Get jobs by multiple categories (for recommendations)
 * Body:
 *   - categories: string[]
 *   - limit: number (optional, default: 20)
 */
router.post("/by-categories", auth(), JobController.getJobsByCategories);

/**
 * PATCH /api/v1/jobs/:id
 * Update a job (owner only)
 */
router.patch(
  "/:id",
  auth(UserType.EMPLOYER),
  validateRequest(JobValidation.updateJobDto),
  JobController.updateJob
);

/**
 * DELETE /api/v1/jobs/:id
 * Delete a job (soft delete - owner only)
 */
router.delete("/:id", auth(UserType.EMPLOYER), JobController.deleteJob);

/**
 * POST /api/v1/jobs/:id/apply
 * Increment application count for a job (when someone applies)
 */
router.post("/:id/apply", auth(UserType.CANDIDATE), JobController.incrementApplicationCount);

/**
 * ADMIN ROUTES
 */

/**
 * POST /api/v1/jobs/bulk-update-status
 * Bulk update job status (admin only)
 * Body:
 *   - jobIds: string[]
 *   - status: "active" | "closed" | "draft" | "expired"
 */
router.post(
  "/bulk-update-status",
  auth(UserType.ADMIN),
  JobController.bulkUpdateStatus
);

/**
 * POST /api/v1/jobs/expire-old
 * Expire old jobs past their deadline (admin/cron job)
 */
router.post("/expire-old", auth(UserType.ADMIN), JobController.expireOldJobs);

export const JobRoutes: Router = router;
