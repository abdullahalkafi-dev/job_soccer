import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { SearchHistoryService } from "./searchHistory.service";

/**
 * Get top 5 search terms for all entity types (jobs, candidates, employers)
 * GET /api/v1/search-history/top
 */
const getTopSearches = catchAsync(async (req: Request, res: Response) => {
  const result = await SearchHistoryService.getAllTopSearches();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Top search terms retrieved successfully",
    data: result,
  });
});

export const SearchHistoryController = {
  getTopSearches,
};
