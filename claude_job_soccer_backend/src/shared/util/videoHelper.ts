import { promises as fs } from "fs";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import {
  VideoType,
  IVideoMetadata,
  IVideoValidationResult,
  IVideo,
} from "../constant/video.constant";
import {
  getVideoRequirements,
  isOfficeStaff,
  validateOfficeStaffVideoCount,
} from "../constant/videoRequirements.config";

/**
 * Get video duration using get-video-duration package
 * No external dependencies required - pure Node.js solution
 */
export const getVideoDuration = async (
  filePath: string
): Promise<number> => {
  try {
    // Dynamically import get-video-duration
    const { getVideoDurationInSeconds } = await import("get-video-duration");
    
    const duration = await getVideoDurationInSeconds(filePath);

    if (isNaN(duration) || duration <= 0) {
      throw new Error("Invalid duration value");
    }

    return Math.round(duration);
  } catch (error: any) {
    console.error("Error getting video duration:", error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to get video duration: ${error.message}. Make sure 'get-video-duration' package is installed.`
    );
  }
};

/**
 * Validate videos based on position requirements
 */
export const validateVideos = async (
  position: string,
  videoMetadata: IVideoMetadata[],
  videoFiles: Express.Multer.File[]
): Promise<IVideoValidationResult> => {
  // Check if files match metadata
  if (videoFiles.length !== videoMetadata.length) {
    return {
      isValid: false,
      error: `Mismatch: ${videoFiles.length} files uploaded but ${videoMetadata.length} metadata entries provided`,
    };
  }

  // Get requirements for this position
  let requirements;
  try {
    requirements = getVideoRequirements(position);
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message,
    };
  }

  // Special handling for office staff (1 or 2 videos allowed)
  if (isOfficeStaff(position)) {
    if (!validateOfficeStaffVideoCount(videoFiles.length)) {
      return {
        isValid: false,
        error: `${position} requires 1 or 2 videos (Pre-recorded Interview is mandatory, Methodology is optional)`,
      };
    }
  } else {
    // For non-office staff, exact count required
    if (videoFiles.length !== requirements.totalVideos) {
      return {
        isValid: false,
        error: `${position} requires exactly ${requirements.totalVideos} videos, received ${videoFiles.length}`,
      };
    }
  }

  // Extract submitted types
  const submittedTypes = videoMetadata.map((v) => v.type);

  // Check for required types
  const requiredTypes = requirements.requiredVideoTypes
    .filter((r) => r.required)
    .map((r) => r.type);

  for (const requiredType of requiredTypes) {
    if (!submittedTypes.includes(requiredType)) {
      return {
        isValid: false,
        error: `Missing required video type: ${requiredType}`,
      };
    }
  }

  // Check for duplicate types
  const uniqueTypes = new Set(submittedTypes);
  if (uniqueTypes.size !== submittedTypes.length) {
    return {
      isValid: false,
      error: "Duplicate video types are not allowed",
    };
  }

  // Check for forbidden types (if any)
  if (requirements.forbiddenVideoTypes) {
    for (const submittedType of submittedTypes) {
      if (requirements.forbiddenVideoTypes.includes(submittedType)) {
        return {
          isValid: false,
          error: `${submittedType} is not allowed for ${position}`,
        };
      }
    }
  }

  // Validate allowed types for this position
  const allowedTypes = requirements.requiredVideoTypes.map((r) => r.type);
  for (const submittedType of submittedTypes) {
    if (!allowedTypes.includes(submittedType)) {
      return {
        isValid: false,
        error: `${submittedType} is not a valid video type for ${position}`,
      };
    }
  }

  // Check video durations
  for (let i = 0; i < videoFiles.length; i++) {
    try {
      const duration = await getVideoDuration(videoFiles[i].path);

      if (duration > requirements.maxDuration) {
        return {
          isValid: false,
          error: `Video "${videoMetadata[i].type}" exceeds maximum duration of ${requirements.maxDuration / 60} minutes (actual: ${Math.round(duration)}s)`,
        };
      }

      // Store duration in file object for later use
      (videoFiles[i] as any).duration = duration;
    } catch (error: any) {
      return {
        isValid: false,
        error: `Failed to validate video "${videoMetadata[i].type}": ${error.message}`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Process videos after validation
 * Maps video files with metadata and prepares for storage
 */
export const processVideos = async (
  videoFiles: Express.Multer.File[],
  videoMetadata: IVideoMetadata[]
): Promise<Partial<IVideo>[]> => {
  return videoFiles.map((file, index) => {
    const metadata = videoMetadata[index];
    const duration = (file as any).duration || 0;

    return {
      videoType: metadata.type,
      url: file.path, // This will be replaced with S3/cloud URL in actual implementation
      duration: duration,
      title: metadata.title,
      description: metadata.description,
      uploadedAt: new Date(),
    };
  });
};

/**
 * Clean up uploaded files from local storage
 * Use this when validation fails or on error
 */
export const cleanupUploadedFiles = async (
  files: Express.Multer.File[]
): Promise<void> => {
  if (!files || files.length === 0) {
    return;
  }

  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.unlink(file.path);
        console.log(`Deleted file: ${file.path}`);
      } catch (error) {
        console.error(`Failed to delete file: ${file.path}`, error);
      }
    })
  );
};

/**
 * Helper to extract video files from request
 */
export const extractVideoFiles = (req: any): Express.Multer.File[] => {
  return (req.files as { [fieldname: string]: Express.Multer.File[] })
    ?.videos || [];
};
