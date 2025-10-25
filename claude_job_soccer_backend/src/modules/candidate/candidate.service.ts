import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { CandidateRole } from "../user/user.interface";

// Import Candidate Models
import { AmateurPlayerCan } from "./amateurPlayerCan/amateurPlayerCan.model";
import { ProfessionalPlayerCan } from "./professionalPlayerCan/professionalPlayerCan.model";
import { OnFieldStaffCan } from "./onFieldStaffCan/onFieldStaffCan.model";
import { OfficeStaffCan } from "./officeStaffCan/officeStaffCan.model";
import { HighSchoolCan } from "./highSchoolCan/highSchoolCan.model";
import { CollegeOrUniversity } from "./collegeOrUniversityCan/collegeOrUniversityCan.model";

/**
 * Get candidate model based on role
 */
const getCandidateModel = (role: CandidateRole): any => {
  switch (role) {
    case CandidateRole.PROFESSIONAL_PLAYER:
      return ProfessionalPlayerCan;
    case CandidateRole.AMATEUR_PLAYER:
      return AmateurPlayerCan;
    case CandidateRole.HIGH_SCHOOL:
      return HighSchoolCan;
    case CandidateRole.COLLEGE_UNIVERSITY:
      return CollegeOrUniversity;
    case CandidateRole.ON_FIELD_STAFF:
      return OnFieldStaffCan;
    case CandidateRole.OFFICE_STAFF:
      return OfficeStaffCan;
    default:
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid candidate role");
  }
};

/**
 * Search candidates by name, category, and country
 * Supports pagination, sorting, and filtering
 */
const searchCandidates = async (query: Record<string, unknown>) => {
  const {
    searchTerm,
    role,
    country,
    page = 1,
    limit = 10,
    sortBy = "-profileAIScore",
  } = query;

  // Build base user query for candidates only
  let userQuery: any = {
    userType: "candidate",
    isDeleted: { $ne: true },
    profileId: { $exists: true, $ne: null }, // Only users with profiles
  };

  // Filter by candidate role/category if provided
  if (role) {
    userQuery.role = role;
  }

  // Search by name (firstName or lastName)
  if (searchTerm) {
    userQuery.$or = [
      { firstName: { $regex: searchTerm, $options: "i" } },
      { lastName: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Get users matching the criteria
  const users = await User.find(userQuery)
    .sort(sortBy as string)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  // Fetch profile details for each user
  const candidatesWithProfiles = await Promise.all(
    users.map(async (user) => {
      const candidateModel = getCandidateModel(user.role as CandidateRole);
      let profile = await candidateModel.findById(user.profileId).lean();

      // Filter by country if specified
      if (country && profile && (profile as any).country !== country) {
        return null;
      }

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        profileAIScore: user.profileAIScore,
        userType: user.userType,
        profile,
      };
    })
  );

  // Filter out null values (candidates that didn't match country filter)
  const filteredCandidates = candidatesWithProfiles.filter(
    (candidate) => candidate !== null
  );

  // Count total for pagination
  const total = await User.countDocuments(userQuery);
  const totalPage = Math.ceil(total / Number(limit));

  return {
    result: filteredCandidates,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage,
    },
  };
};

/**
 * Get featured candidates grouped by category
 * Returns max 4 candidates per category
 */
const getFeaturedCandidates = async () => {
  const categories = [
    CandidateRole.PROFESSIONAL_PLAYER,
    CandidateRole.AMATEUR_PLAYER,
    CandidateRole.HIGH_SCHOOL,
    CandidateRole.COLLEGE_UNIVERSITY,
    CandidateRole.ON_FIELD_STAFF,
    CandidateRole.OFFICE_STAFF,
  ];

  const featuredCandidates: Record<string, any[]> = {};

  await Promise.all(
    categories.map(async (category) => {
      // Get top 4 candidates from each category sorted by AI score
      const users = await User.find({
        userType: "candidate",
        role: category,
        isDeleted: { $ne: true },
        profileId: { $exists: true, $ne: null },
      })
        .sort({ profileAIScore: -1 }) // Sort by highest AI score
        .limit(4)
        .lean();

      // Fetch profile details for each user
      const candidatesWithProfiles = await Promise.all(
        users.map(async (user) => {
          const candidateModel = getCandidateModel(user.role as CandidateRole);
          const profile = await candidateModel.findById(user.profileId).lean();

          return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            profileAIScore: user.profileAIScore,
            userType: user.userType,
            profile,
          };
        })
      );

      // Use a more readable key name
      const categoryKey = category.replace(/\s+/g, "");
      featuredCandidates[categoryKey] = candidatesWithProfiles;
    })
  );

  return featuredCandidates;
};

/**
 * Get candidate by ID with full profile details
 */
const getCandidateById = async (id: string) => {
  const user = await User.findById(id).lean();

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "Candidate not found");
  }

  if (user.userType !== "candidate") {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not a candidate");
  }

  if (!user.profileId) {
    throw new AppError(StatusCodes.NOT_FOUND, "Candidate profile not found");
  }

  // Get profile details
  const candidateModel = getCandidateModel(user.role as CandidateRole);
  const profile = await candidateModel.findById(user.profileId).lean();

  if (!profile) {
    throw new AppError(StatusCodes.NOT_FOUND, "Profile details not found");
  }

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    profileAIScore: user.profileAIScore,
    userType: user.userType,
    isVerified: user.isVerified,
    profile,
  };
};

export const CandidateServices = {
  searchCandidates,
  getFeaturedCandidates,
  getCandidateById,
};
