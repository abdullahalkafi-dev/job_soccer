import express, { Router } from "express";
import { CandidateController } from "./candidate.controller";

const router = express.Router();

/**
 * GET /api/v1/candidates/search
 * Search candidates by name, category, and country
 * Query params:
 *   - searchTerm: string (search in firstName, lastName)
 *   - role: string (candidate category/role)
 *   - country: string (filter by country)
 *   - page: number (default: 1)
 *   - limit: number (default: 10)
 *   - sortBy: string (default: -profileAIScore)
 */
router.get("/search", CandidateController.searchCandidates);

/**
 * GET /api/v1/candidates/featured
 * Get featured candidates grouped by category
 * Returns max 4 candidates per category
 * Response format: 
 * {
 *   "ProfessionalPlayer": [{...}, {...}],
 *   "AmateurPlayer": [{...}, {...}],
 *   "HighSchool": [{...}, {...}],
 *   "College/University": [{...}, {...}],
 *   "OnFieldStaff": [{...}, {...}],
 *   "OfficeStaff": [{...}, {...}]
 * }
 */
router.get("/featured", CandidateController.getFeaturedCandidates);

/**
 * GET /api/v1/candidates/:id
 * Get candidate by ID with full profile details
 */
router.get("/:id", CandidateController.getCandidateById);

export const CandidateRoutes: Router = router;
