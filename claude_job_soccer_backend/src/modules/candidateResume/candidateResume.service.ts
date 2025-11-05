import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { CandidateResume } from "./candidateResume.model";
import { TCandidateResume } from "./candidateResume.interface";
import { User } from "../user/user.model";
import { UserType } from "../user/user.interface";
import fs from "fs";
import path from "path";

/**
 * Add a new resume for a candidate
 * Candidates can have multiple resumes
 */
const addResume = async (
  userId: string,
  file: Express.Multer.File,
  setAsActive: boolean = false
): Promise<TCandidateResume> => {
  if (!file) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Resume file is required");
  }

  // Verify user exists and is a candidate
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.userType !== UserType.CANDIDATE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only candidates can upload resumes"
    );
  }

  if (!user.profileId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User does not have a candidate profile"
    );
  }

  // If setting as active, deactivate all other resumes first
  if (setAsActive) {
    await CandidateResume.updateMany(
      { userId },
      { $set: { isActive: false } }
    );
  }

  // Create new resume entry with URL format: /docs/filename.pdf
  const resumeUrl = `/docs/${file.filename}`;

  const newResume = await CandidateResume.create({
    userId,
    profileId: user.profileId,
    candidateRole: user.role,
    resumeFileName: file.filename,
    resumeUrl,
    isActive: setAsActive,
  });

  return newResume;
};

/**
 * Remove a specific resume by ID
 * Does NOT delete the file (keeps for job application history)
 */
const removeResume = async (
  resumeId: string,
  userId: string
): Promise<void> => {
  const resume = await CandidateResume.findOne({
    _id: resumeId,
    userId: userId,
  });

  if (!resume) {
    throw new AppError(StatusCodes.NOT_FOUND, "Resume not found");
  }

  // Only delete from database, keep file for job application history
  await CandidateResume.deleteOne({ _id: resumeId });
};

/**
 * Get all resumes for a user
 */
const getAllResumes = async (userId: string): Promise<TCandidateResume[]> => {
  const resumes = await CandidateResume.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return resumes as TCandidateResume[];
};

/**
 * Get a specific resume by ID
 */
const getResumeById = async (resumeId: string): Promise<TCandidateResume> => {
  const resume = await CandidateResume.findById(resumeId).lean();

  if (!resume) {
    throw new AppError(StatusCodes.NOT_FOUND, "Resume not found");
  }

  return resume as TCandidateResume;
};

/**
 * Get the active resume for a user
 */
const getActiveResume = async (
  userId: string
): Promise<TCandidateResume | null> => {
  const resume = await CandidateResume.findOne({
    userId,
    isActive: true,
  }).lean();

  return resume as TCandidateResume | null;
};

/**
 * Get active resumes for multiple users
 */
const getActiveResumesByUsers = async (
  userIds: string[]
): Promise<TCandidateResume[]> => {
  const resumes = await CandidateResume.find({
    userId: { $in: userIds },
    isActive: true,
  }).lean();

  return resumes as TCandidateResume[];
};

/**
 * Get all resumes for multiple users
 */
const getResumesByUsers = async (
  userIds: string[]
): Promise<TCandidateResume[]> => {
  const resumes = await CandidateResume.find({
    userId: { $in: userIds },
  })
    .sort({ userId: 1, createdAt: -1 })
    .lean();

  return resumes as TCandidateResume[];
};

/**
 * Set a resume as active (and deactivate others)
 */
const setActiveResume = async (
  resumeId: string,
  userId: string
): Promise<TCandidateResume> => {
  const resume = await CandidateResume.findOne({ _id: resumeId, userId });

  if (!resume) {
    throw new AppError(StatusCodes.NOT_FOUND, "Resume not found");
  }

  // Deactivate all other resumes for this user
  await CandidateResume.updateMany({ userId }, { $set: { isActive: false } });

  // Set this resume as active
  resume.isActive = true;
  await resume.save();

  return resume;
};

/**
 * Check if a user has any resumes
 */
const hasResume = async (userId: string): Promise<boolean> => {
  const count = await CandidateResume.countDocuments({ userId });
  return count > 0;
};

/**
 * Get resume count for a user
 */
const getResumeCount = async (userId: string): Promise<number> => {
  return await CandidateResume.countDocuments({ userId });
};

export const CandidateResumeService = {
  addResume,
  removeResume,
  getAllResumes,
  getResumeById,
  getActiveResume,
  getActiveResumesByUsers,
  getResumesByUsers,
  setActiveResume,
  hasResume,
  getResumeCount,
};
