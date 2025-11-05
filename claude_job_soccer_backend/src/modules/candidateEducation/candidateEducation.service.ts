import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { CandidateEducation } from "./candidateEducation.model";
import { TCandidateEducation } from "./candidateEducation.interface";
import { User } from "../user/user.model";
import { UserType } from "../user/user.interface";

/**
 * Add a new education record for a candidate
 * Candidates can have multiple education records
 */
const addEducation = async (
  userId: string,
  educationData: Partial<TCandidateEducation>
): Promise<TCandidateEducation> => {
  // Verify user exists and is a candidate
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.userType !== UserType.CANDIDATE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only candidates can add education records"
    );
  }

  if (!user.profileId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User does not have a candidate profile"
    );
  }

  // Create new education entry
  const newEducation = await CandidateEducation.create({
    ...educationData,
    userId,
    profileId: user.profileId,
    candidateRole: user.role,
  });

  return newEducation;
};

/**
 * Update an existing education record
 */
const updateEducation = async (
  educationId: string,
  userId: string,
  updateData: Partial<TCandidateEducation>
): Promise<TCandidateEducation> => {
  const education = await CandidateEducation.findOne({
    _id: educationId,
    userId: userId,
  });

  if (!education) {
    throw new AppError(StatusCodes.NOT_FOUND, "Education record not found");
  }

  // Update the education record
  const updatedEducation = await CandidateEducation.findByIdAndUpdate(
    educationId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedEducation) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update education record"
    );
  }

  return updatedEducation;
};

/**
 * Remove a specific education record by ID
 */
const removeEducation = async (
  educationId: string,
  userId: string
): Promise<void> => {
  const education = await CandidateEducation.findOne({
    _id: educationId,
    userId: userId,
  });

  if (!education) {
    throw new AppError(StatusCodes.NOT_FOUND, "Education record not found");
  }

  await CandidateEducation.deleteOne({ _id: educationId });
};

/**
 * Get all education records for a user
 */
const getAllEducationsByUser = async (
  userId: string
): Promise<TCandidateEducation[]> => {
  const educations = await CandidateEducation.find({ userId })
    .sort({ startYear: -1, startMonth: -1 }) // Most recent first
    .lean();

  return educations as TCandidateEducation[];
};

/**
 * Get a specific education record by ID
 */
const getEducationById = async (
  educationId: string
): Promise<TCandidateEducation> => {
  const education = await CandidateEducation.findById(educationId).lean();

  if (!education) {
    throw new AppError(StatusCodes.NOT_FOUND, "Education record not found");
  }

  return education as TCandidateEducation;
};

/**
 * Get education records for multiple users (bulk)
 * Useful for employers viewing multiple candidates
 */
const getEducationsByUsers = async (
  userIds: string[]
): Promise<Record<string, TCandidateEducation[]>> => {
  const educations = await CandidateEducation.find({
    userId: { $in: userIds },
  })
    .sort({ startYear: -1, startMonth: -1 })
    .lean();

  // Group by userId
  const grouped = educations.reduce((acc, edu) => {
    const key = edu.userId.toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(edu as TCandidateEducation);
    return acc;
  }, {} as Record<string, TCandidateEducation[]>);

  return grouped;
};

export const CandidateEducationService = {
  addEducation,
  updateEducation,
  removeEducation,
  getAllEducationsByUser,
  getEducationById,
  getEducationsByUsers,
};
