import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { CandidateShortListService } from "./candidateShortList.service";
import {
  CandidateRole,
  EmployerRole,
  UserType,
} from "../user/user.interface";

const shortlistCandidate = catchAsync(async (req: Request, res: Response) => {
  const shortlistedById = req.user?.id;
  const shortlistedByType = req.user?.userType as
    | UserType.CANDIDATE
    | UserType.EMPLOYER;
  const shortlistedByRole = req.user?.role as
    | CandidateRole
    | EmployerRole;
  const { candidateId } = req.body;

  const result = await CandidateShortListService.shortlistCandidate(
    shortlistedById!,
    shortlistedByType,
    shortlistedByRole!,
    candidateId
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Candidate shortlisted successfully",
    data: result,
  });
});

const removeShortlistedCandidate = catchAsync(
  async (req: Request, res: Response) => {
    const shortlistedById = req.user?.id;
    const { candidateId } = req.params;

    await CandidateShortListService.removeShortlistedCandidate(
      shortlistedById!,
      candidateId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Candidate removed from shortlist successfully",
      data: null,
    });
  }
);

const getShortlistedCandidates = catchAsync(
  async (req: Request, res: Response) => {
    const shortlistedById = req.user?.id;

    const result = await CandidateShortListService.getShortlistedCandidates(
      shortlistedById!,
      req.query
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Shortlisted candidates retrieved successfully",
      data: result.data,
      meta: {
        page: result.meta.page,
        limit: result.meta.limit,
        totalPage: result.meta.totalPages,
        total: result.meta.total,
      },
    });
  }
);

const getShortlistedCandidatesCount = catchAsync(
  async (req: Request, res: Response) => {
    const shortlistedById = req.user?.id;

    const count = await CandidateShortListService.getShortlistedCandidatesCount(
      shortlistedById!
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Shortlisted candidates count retrieved successfully",
      data: { count },
    });
  }
);

const checkIfCandidateShortlisted = catchAsync(
  async (req: Request, res: Response) => {
    const shortlistedById = req.user?.id;
    const { candidateId } = req.params;

    const isShortlisted = await CandidateShortListService.isCandidateShortlisted(
      shortlistedById!,
      candidateId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Candidate shortlist status retrieved successfully",
      data: { isShortlisted },
    });
  }
);

const getCandidateShortlistedBy = catchAsync(
  async (req: Request, res: Response) => {
    const { candidateId } = req.params;

    const result = await CandidateShortListService.getCandidateShortlistedBy(
      candidateId,
      req.query
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Candidate followers retrieved successfully",
      data: result.data,
      meta: {
        page: result.meta.page,
        limit: result.meta.limit,
        totalPage: result.meta.totalPages,
        total: result.meta.total,
      },
    });
  }
);

const getCandidateShortlistedByCount = catchAsync(
  async (req: Request, res: Response) => {
    const { candidateId } = req.params;

    const count =
      await CandidateShortListService.getCandidateShortlistedByCount(
        candidateId
      );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Candidate followers count retrieved successfully",
      data: { count },
    });
  }
);

export const CandidateShortListController = {
  shortlistCandidate,
  removeShortlistedCandidate,
  getShortlistedCandidates,
  getShortlistedCandidatesCount,
  checkIfCandidateShortlisted,
  getCandidateShortlistedBy,
  getCandidateShortlistedByCount,
};
