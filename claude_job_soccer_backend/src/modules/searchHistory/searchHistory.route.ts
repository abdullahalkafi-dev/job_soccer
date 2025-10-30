import express, { Router } from "express";
import { SearchHistoryController } from "./searchHistory.controller";

const router: Router = express.Router();

/**
 * @route GET /api/v1/search-history/top
 * @desc Get top 5 search keywords for jobs, candidates, and employers
 * @access Public
 */
router.get("/top", SearchHistoryController.getTopSearches);

export const SearchHistoryRoutes = router;
