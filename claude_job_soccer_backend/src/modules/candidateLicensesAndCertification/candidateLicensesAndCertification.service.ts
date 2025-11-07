import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { CandidateLicenseAndCertification } from "./candidateLicensesAndCertification.model";
import { TCandidateLicenseAndCertification } from "./candidateLicensesAndCertification.interface";
import { User } from "../user/user.model";
import { UserType } from "../user/user.interface";

/**
 * Add a new license and certification record for a candidate
 * Candidates can have multiple license and certification records
 */
const addLicenseAndCertification = async (
  userId: string,
  licenseData: Partial<TCandidateLicenseAndCertification>
): Promise<TCandidateLicenseAndCertification> => {
  // Verify user exists and is a candidate
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.userType !== UserType.CANDIDATE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only candidates can add license and certification records"
    );
  }

  if (!user.profileId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User does not have a candidate profile"
    );
  }

  // Create new license and certification entry
  const newLicense = await CandidateLicenseAndCertification.create({
    ...licenseData,
    userId,
    profileId: user.profileId,
    candidateRole: user.role,
  });

  return newLicense;
};

/**
 * Update an existing license and certification record
 */
const updateLicenseAndCertification = async (
  licenseId: string,
  userId: string,
  updateData: Partial<TCandidateLicenseAndCertification>
): Promise<TCandidateLicenseAndCertification> => {
  const license = await CandidateLicenseAndCertification.findOne({
    _id: licenseId,
    userId: userId,
  });

  if (!license) {
    throw new AppError(StatusCodes.NOT_FOUND, "License and certification record not found");
  }

  // Update the license and certification record
  const updatedLicense = await CandidateLicenseAndCertification.findByIdAndUpdate(
    licenseId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedLicense) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update license and certification record"
    );
  }

  return updatedLicense;
};

/**
 * Remove a specific license and certification record by ID
 */
const removeLicenseAndCertification = async (
  licenseId: string,
  userId: string
): Promise<void> => {
  const license = await CandidateLicenseAndCertification.findOne({
    _id: licenseId,
    userId: userId,
  });

  if (!license) {
    throw new AppError(StatusCodes.NOT_FOUND, "License and certification record not found");
  }

  await CandidateLicenseAndCertification.deleteOne({ _id: licenseId });
};

/**
 * Get all license and certification records for a user
 */
const getAllLicensesAndCertificationsByUser = async (
  userId: string
): Promise<TCandidateLicenseAndCertification[]> => {
  const licenses = await CandidateLicenseAndCertification.find({ userId })
    .sort({ startYear: -1, startMonth: -1 }) // Most recent first
    .lean();

  return licenses as TCandidateLicenseAndCertification[];
};

/**
 * Get a specific license and certification record by ID
 */
const getLicenseAndCertificationById = async (
  licenseId: string
): Promise<TCandidateLicenseAndCertification> => {
  const license = await CandidateLicenseAndCertification.findById(licenseId).lean();

  if (!license) {
    throw new AppError(StatusCodes.NOT_FOUND, "License and certification record not found");
  }

  return license as TCandidateLicenseAndCertification;
};

/**
 * Get license and certification records for multiple users (bulk)
 * Useful for employers viewing multiple candidates
 */
const getLicensesAndCertificationsByUsers = async (
  userIds: string[]
): Promise<Record<string, TCandidateLicenseAndCertification[]>> => {
  const licenses = await CandidateLicenseAndCertification.find({
    userId: { $in: userIds },
  })
    .sort({ startYear: -1, startMonth: -1 })
    .lean();

  // Group by userId
  const grouped = licenses.reduce((acc, license) => {
    const key = license.userId.toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(license as TCandidateLicenseAndCertification);
    return acc;
  }, {} as Record<string, TCandidateLicenseAndCertification[]>);

  return grouped;
};

export const CandidateLicensesAndCertificationService = {
  addLicenseAndCertification,
  updateLicenseAndCertification,
  removeLicenseAndCertification,
  getAllLicensesAndCertificationsByUser,
  getLicenseAndCertificationById,
  getLicensesAndCertificationsByUsers,
};
