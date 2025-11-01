import { Types } from "mongoose";
import { CandidateShortList } from "./candidateShortList.model";
import { TCandidateShortList } from "./candidateShortList.interface";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import { CandidateRole, EmployerRole, UserType } from "../user/user.interface";

/**
 * Shortlist a candidate
 * Both candidates and employers can shortlist candidates
 */
const shortlistCandidate = async (
  shortlistedById: string,
  shortlistedByType: UserType.CANDIDATE | UserType.EMPLOYER,
  shortlistedByRole: CandidateRole | EmployerRole,
  candidateId: string
): Promise<TCandidateShortList> => {
  if (shortlistedById === candidateId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You cannot shortlist yourself"
    );
  }

  const candidate = await User.findById(candidateId);
  if (!candidate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Candidate not found");
  }

  if (candidate.userType !== UserType.CANDIDATE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can only shortlist candidate profiles"
    );
  }

  if (candidate.isDeleted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This candidate profile is not available"
    );
  }

  const existingShortlist = await CandidateShortList.findOne({
    shortlistedById: new Types.ObjectId(shortlistedById),
    candidateId: new Types.ObjectId(candidateId),
  });

  if (existingShortlist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Candidate is already in your shortlist"
    );
  }

  const shortlistEntry = await CandidateShortList.create({
    candidateId: candidate._id,
    candidateRole: candidate.role as CandidateRole,
    shortlistedById: new Types.ObjectId(shortlistedById),
    shortlistedByType,
    shortlistedByRole,
  });

  const populatedEntry = await CandidateShortList.findById(shortlistEntry._id)
    .populate({
      path: "candidateId",
      select:
        "firstName lastName email role userType createdAt profileImage profileId",
    })
    .lean();

  return populatedEntry as TCandidateShortList;
};

/**
 * Remove a candidate from shortlist
 */
const removeShortlistedCandidate = async (
  shortlistedById: string,
  candidateId: string
): Promise<void> => {
  const result = await CandidateShortList.findOneAndDelete({
    shortlistedById: new Types.ObjectId(shortlistedById),
    candidateId: new Types.ObjectId(candidateId),
  });

  if (!result) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Candidate not found in your shortlist"
    );
  }
};

/**
 * Get all candidates that a user has shortlisted with pagination
 */
const getShortlistedCandidates = async (
  shortlistedById: string,
  query: Record<string, any>
): Promise<{
  data: TCandidateShortList[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {
    shortlistedById: new Types.ObjectId(shortlistedById),
  };

  if (query.candidateRole) {
    filter.candidateRole = query.candidateRole;
  }

  const total = await CandidateShortList.countDocuments(filter);

  const data = await CandidateShortList.find(filter)
    .populate({
      path: "candidateId",
      select:
        "firstName lastName email role userType createdAt profileImage profileId",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  return {
    data: data as TCandidateShortList[],
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get count of candidates that the authenticated user has shortlisted
 */
const getShortlistedCandidatesCount = async (
  shortlistedById: string
): Promise<number> => {
  const count = await CandidateShortList.countDocuments({
    shortlistedById: new Types.ObjectId(shortlistedById),
  });

  return count;
};

/**
 * Check if a candidate is shortlisted by a user
 */
const isCandidateShortlisted = async (
  shortlistedById: string,
  candidateId: string
): Promise<boolean> => {
  const shortlist = await CandidateShortList.findOne({
    shortlistedById: new Types.ObjectId(shortlistedById),
    candidateId: new Types.ObjectId(candidateId),
  });

  return !!shortlist;
};

/**
 * Get all users who have shortlisted a specific candidate with pagination
 */
const getCandidateShortlistedBy = async (
  candidateId: string,
  query: Record<string, any>
): Promise<{
  data: TCandidateShortList[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {
    candidateId: new Types.ObjectId(candidateId),
  };

  if (query.shortlistedByType) {
    filter.shortlistedByType = query.shortlistedByType;
  }

  if (query.shortlistedByRole) {
    filter.shortlistedByRole = query.shortlistedByRole;
  }

  const total = await CandidateShortList.countDocuments(filter);

  const data = await CandidateShortList.find(filter)
    .populate({
      path: "shortlistedById",
      select:
        "firstName lastName email role userType createdAt profileImage profileId",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  return {
    data: data as TCandidateShortList[],
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get count of users who have shortlisted a specific candidate
 */
const getCandidateShortlistedByCount = async (
  candidateId: string
): Promise<number> => {
  const count = await CandidateShortList.countDocuments({
    candidateId: new Types.ObjectId(candidateId),
  });

  return count;
};

export const CandidateShortListService = {
  shortlistCandidate,
  removeShortlistedCandidate,
  getShortlistedCandidates,
  getShortlistedCandidatesCount,
  isCandidateShortlisted,
  getCandidateShortlistedBy,
  getCandidateShortlistedByCount,
};
