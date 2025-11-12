import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { CandidateExperience } from "./candidateExperience.model";
import { TCandidateExperience } from "./candidateExperience.interface";
import { User } from "../user/user.model";
import { UserType } from "../user/user.interface";
import { candidateExperienceCache } from "./candidateExpreience.cache";

/**
 * Add a new experience record for a candidate
 * Candidates can have multiple experience records
 */
const addExperience = async (
  userId: string,
  experienceData: Partial<TCandidateExperience>
): Promise<TCandidateExperience> => {
  // Verify user exists and is a candidate
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.userType !== UserType.CANDIDATE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only candidates can add experience records"
    );
  }

  if (!user.profileId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User does not have a candidate profile"
    );
  }

  // Validate that if isCurrentlyWorking is true, endMonth and endYear should not be provided
  if (experienceData.isCurrentlyWorking) {
    if (experienceData.endMonth || experienceData.endYear) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "End date cannot be provided for currently working positions"
      );
    }
  }

  // Create new experience entry
  const newExperience = await CandidateExperience.create({
    ...experienceData,
    userId,
    profileId: user.profileId,
    candidateRole: user.role,
  });

  // Invalidate cache after adding
  await candidateExperienceCache.invalidateUserCache(userId, user.profileId);

  return newExperience;
};

/**
 * Update an existing experience record
 */
const updateExperience = async (
  experienceId: string,
  userId: string,
  updateData: Partial<TCandidateExperience>
): Promise<TCandidateExperience> => {
  const experience = await CandidateExperience.findOne({
    _id: experienceId,
    userId: userId,
  });

  if (!experience) {
    throw new AppError(StatusCodes.NOT_FOUND, "Experience record not found");
  }

  // Validate that if isCurrentlyWorking is true, endMonth and endYear should not be provided
  if (updateData.isCurrentlyWorking) {
    if (updateData.endMonth || updateData.endYear) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "End date cannot be provided for currently working positions"
      );
    }
    // Clear end date if switching to currently working
    updateData.endMonth = undefined;
    updateData.endYear = undefined;
  }

  // Update the experience record
  const updatedExperience = await CandidateExperience.findByIdAndUpdate(
    experienceId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedExperience) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update experience record"
    );
  }

  // Invalidate cache after updating
  await candidateExperienceCache.invalidateUserCache(userId, experience.profileId);
  await candidateExperienceCache.deleteCache(
    candidateExperienceCache.getCacheKey.byId(experienceId)
  );

  return updatedExperience;
};

/**
 * Remove a specific experience record by ID
 */
const removeExperience = async (
  experienceId: string,
  userId: string
): Promise<void> => {
  const experience = await CandidateExperience.findOne({
    _id: experienceId,
    userId: userId,
  });

  if (!experience) {
    throw new AppError(StatusCodes.NOT_FOUND, "Experience record not found");
  }

  await CandidateExperience.deleteOne({ _id: experienceId });

  // Invalidate cache after deleting
  await candidateExperienceCache.invalidateUserCache(userId, experience.profileId);
  await candidateExperienceCache.deleteCache(
    candidateExperienceCache.getCacheKey.byId(experienceId)
  );
};

/**
 * Get all experience records for a user
 */
const getAllExperiencesByUser = async (
  userId: string
): Promise<TCandidateExperience[]> => {
  const cacheKey = candidateExperienceCache.getCacheKey.byUser(userId);

  // Try to get from cache
  const cachedData = await candidateExperienceCache.getCache<TCandidateExperience[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // If not in cache, fetch from database
  const experiences = await CandidateExperience.find({ userId })
    .sort({ isCurrentlyWorking: -1, startYear: -1, startMonth: -1 }) // Currently working first, then most recent
    .lean();

  const result = experiences as TCandidateExperience[];

  // Store in cache
  await candidateExperienceCache.setCache(cacheKey, result, candidateExperienceCache.CACHE_TTL);

  return result;
};

/**
 * Get a specific experience record by ID
 */
const getExperienceById = async (
  experienceId: string
): Promise<TCandidateExperience> => {
  const cacheKey = candidateExperienceCache.getCacheKey.byId(experienceId);

  // Try to get from cache
  const cachedData = await candidateExperienceCache.getCache<TCandidateExperience>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // If not in cache, fetch from database
  const experience = await CandidateExperience.findById(experienceId).lean();

  if (!experience) {
    throw new AppError(StatusCodes.NOT_FOUND, "Experience record not found");
  }

  const result = experience as TCandidateExperience;

  // Store in cache
  await candidateExperienceCache.setCache(cacheKey, result, candidateExperienceCache.CACHE_TTL);

  return result;
};

/**
 * Get experience records for multiple users (bulk)
 * Useful for employers viewing multiple candidates
 */
const getExperiencesByUsers = async (
  userIds: string[]
): Promise<Record<string, TCandidateExperience[]>> => {
  const cacheKey = candidateExperienceCache.getCacheKey.byUsers(userIds);

  // Try to get from cache
  const cachedData = await candidateExperienceCache.getCache<Record<string, TCandidateExperience[]>>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // If not in cache, fetch from database
  const experiences = await CandidateExperience.find({
    userId: { $in: userIds },
  })
    .sort({ isCurrentlyWorking: -1, startYear: -1, startMonth: -1 })
    .lean();

  // Group by userId
  const grouped = experiences.reduce((acc, exp) => {
    const key = exp.userId.toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(exp as TCandidateExperience);
    return acc;
  }, {} as Record<string, TCandidateExperience[]>);

  // Store in cache
  await candidateExperienceCache.setCache(cacheKey, grouped, candidateExperienceCache.CACHE_TTL);

  return grouped;
};

/**
 * Get all experience records by profileId
 * Useful for public profile views
 */
const getExperiencesByProfileId = async (
  profileId: string
): Promise<TCandidateExperience[]> => {
  const cacheKey = candidateExperienceCache.getCacheKey.byProfile(profileId);

  // Try to get from cache
  const cachedData = await candidateExperienceCache.getCache<TCandidateExperience[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // If not in cache, fetch from database
  const experiences = await CandidateExperience.find({ profileId })
    .sort({ isCurrentlyWorking: -1, startYear: -1, startMonth: -1 })
    .lean();

  const result = experiences as TCandidateExperience[];

  // Store in cache
  await candidateExperienceCache.setCache(cacheKey, result, candidateExperienceCache.CACHE_TTL);

  return result;
};

export const CandidateExperienceService = {
  addExperience,
  updateExperience,
  removeExperience,
  getAllExperiencesByUser,
  getExperienceById,
  getExperiencesByUsers,
  getExperiencesByProfileId,
};
