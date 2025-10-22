import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../../../errors/AppError";
import { IVideoMetadata } from "../../../shared/constant/video.constant";
import {
  validateVideos,
  processVideos,
  cleanupUploadedFiles,
  extractVideoFiles,
} from "../../../shared/util/videoHelper";
import catchAsync from "../../../shared/util/catchAsync";
import sendResponse from "../../../shared/util/sendResponse";
import { CoachCan } from "./coachCan.model";

/**
 * Example: Create Coach with Videos
 * 
 * Frontend should send:
 * - FormData with:
 *   - data: JSON string of profile data { firstName, lastName, position, ... }
 *   - videoMeta: JSON string of video metadata array [{ type, title, description }, ...]
 *   - videos: Multiple video files (same field name)
 */
export const createCoachWithVideos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Parse profile data
      if (!req.body.data) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Profile data is required"
        );
      }

      const profileData = JSON.parse(req.body.data);

      // 2. Parse video metadata
      if (!req.body.videoMeta) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Video metadata is required"
        );
      }

      const videoMetadata: IVideoMetadata[] = JSON.parse(req.body.videoMeta);

      // 3. Extract uploaded video files
      const videoFiles = extractVideoFiles(req);

      if (videoFiles.length === 0) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "At least one video is required"
        );
      }

      // 4. Validate videos based on position requirements
      const validation = await validateVideos(
        profileData.position,
        videoMetadata,
        videoFiles
      );

      if (!validation.isValid) {
        // Clean up uploaded files before throwing error
        await cleanupUploadedFiles(videoFiles);
        throw new AppError(StatusCodes.BAD_REQUEST, validation.error!);
      }

      // 5. Process videos (map files with metadata)
      const processedVideos = await processVideos(videoFiles, videoMetadata);

      // TODO: Upload videos to S3/cloud storage and get URLs
      // For now, using local file paths
      // In production, you would:
      // const uploadedVideos = await uploadVideosToS3(processedVideos);

      // 6. Create coach record with videos
      const coach = await CoachCan.create({
        ...profileData,
        videos: processedVideos,
      });

      // 7. Send response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Coach created successfully",
        data: coach,
      });
    } catch (error) {
      // Clean up files on any error
      const videoFiles = extractVideoFiles(req);
      if (videoFiles.length > 0) {
        await cleanupUploadedFiles(videoFiles);
      }
      throw error;
    }
  }
);

/**
 * Example: Update Coach Videos
 */
export const updateCoachVideos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { coachId } = req.params;

      // 1. Find existing coach
      const coach = await CoachCan.findById(coachId);
      if (!coach) {
        throw new AppError(StatusCodes.NOT_FOUND, "Coach not found");
      }

      // 2. Parse video metadata
      if (!req.body.videoMeta) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Video metadata is required"
        );
      }

      const videoMetadata: IVideoMetadata[] = JSON.parse(req.body.videoMeta);

      // 3. Extract uploaded video files
      const videoFiles = extractVideoFiles(req);

      if (videoFiles.length === 0) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "At least one video is required"
        );
      }

      // 4. Validate videos
      const validation = await validateVideos(
        coach.position,
        videoMetadata,
        videoFiles
      );

      if (!validation.isValid) {
        await cleanupUploadedFiles(videoFiles);
        throw new AppError(StatusCodes.BAD_REQUEST, validation.error!);
      }

      // 5. Process videos
      const processedVideos = await processVideos(videoFiles, videoMetadata);

      // TODO: Delete old videos from storage
      // TODO: Upload new videos to S3/cloud storage

      // 6. Update coach videos
      coach.videos = processedVideos as any;
      await coach.save();

      // 7. Send response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Coach videos updated successfully",
        data: coach,
      });
    } catch (error) {
      // Clean up files on any error
      const videoFiles = extractVideoFiles(req);
      if (videoFiles.length > 0) {
        await cleanupUploadedFiles(videoFiles);
      }
      throw error;
    }
  }
);
