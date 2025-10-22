# Video Upload and Validation Implementation Guide

## Overview
This implementation handles video uploads for coaches with position-specific validation requirements.

## Key Features
- ✅ Position-based video requirements validation
- ✅ Video duration validation (max 3 minutes)
- ✅ Video type validation
- ✅ Automatic file cleanup on validation failure
- ✅ Support for multiple video formats (mp4, mov, avi, webm)
- ✅ Pre-recorded interview mandatory for all staff positions

## Frontend Implementation

### Form Data Structure

```javascript
const formData = new FormData();

// 1. Profile data as JSON string
formData.append('data', JSON.stringify({
  firstName: "John",
  lastName: "Doe",
  position: "Head Coach",
  dateOfBirth: "1980-01-01",
  placeOfBirth: "London",
  nationality: "British",
  phoneNumber: "+1234567890",
  currentClub: "FC Example",
  boyOrGirl: "Boy",
  category: "Senior",
  agent: "Agent Name",
  availability: "Available",
  league: "Premier League",
  country: "United Kingdom",
  socialMedia: "@johndoe",
  licensesNumber: "UEFA Pro"
}));

// 2. Video metadata as JSON array string
formData.append('videoMeta', JSON.stringify([
  {
    type: "Pre-recorded Interview",
    title: "My Introduction",
    description: "Introduction and background"
  },
  {
    type: "Technical",
    title: "Technical Analysis",
    description: "My technical coaching approach"
  },
  {
    type: "Tactical",
    title: "Tactical Philosophy",
    description: "My tactical methodology"
  },
  {
    type: "Game's Principals",
    title: "Game Principles",
    description: "Core game principles I follow"
  }
]));

// 3. Video files in SAME ORDER as metadata
formData.append('videos', videoFile1); // Pre-recorded Interview
formData.append('videos', videoFile2); // Technical
formData.append('videos', videoFile3); // Tactical
formData.append('videos', videoFile4); // Game's Principals

// 4. Send request
const response = await fetch('/api/coaches', {
  method: 'POST',
  body: formData
});
```

## Video Requirements by Position

### On Field Staff

#### Head Coach & Assistant Coach (4 videos)
1. Pre-recorded Interview (mandatory)
2. Technical video
3. Tactical video
4. Game's Principals video

#### GK Coach, Mental Coach, Video Analyst Coach (2 videos each)
1. Pre-recorded Interview (mandatory)
2. Methodology video

#### Specific Offensive/Defensive/Technical Coach (2 videos each)
1. Pre-recorded Interview (mandatory)
2. Training Methodology video

#### Scout (2 videos)
1. Pre-recorded Interview (mandatory)
2. Scouting Methodology video

#### Technical Director (3 videos)
1. Pre-recorded Interview (mandatory)
2. Club's Philosophy & Methodology video
3. Player Recruitment Methodology video

#### Academy Director (2 videos)
1. Pre-recorded Interview (mandatory)
2. Youth Development Methodology video

#### Director of Coaching (2 videos)
1. Pre-recorded Interview (mandatory)
2. Coaching Recruitment Methodology video

### Office Staff (2 videos)
1. Pre-recorded Interview (mandatory)
2. Methodology video (optional)

**Office Staff can submit 1 or 2 videos** (Pre-recorded Interview is mandatory, Methodology is optional)

Positions:
- Administrative Director
- Community Manager
- Data Analyst
- Digital Marketing
- Medical Staff
- Performance Staff
- Equipment Staff
- Sales

## Backend Implementation

### Route Setup

```typescript
import express from "express";
import fileUploadHandler from "../../../shared/middlewares/fileUploadHandler";
import { createCoachWithVideos, updateCoachVideos } from "./CoachCan.videoController";

const router = express.Router();

// Create coach with videos
router.post(
  "/create",
  fileUploadHandler, // Handles file upload
  createCoachWithVideos // Validates and processes
);

// Update coach videos
router.put(
  "/:coachId/videos",
  fileUploadHandler,
  updateCoachVideos
);

export default router;
```

### Controller Usage

The controller in `CoachCan.videoController.ts` demonstrates:

1. **Parsing request data**
   - Profile data from `req.body.data`
   - Video metadata from `req.body.videoMeta`
   - Video files from `req.files.videos`

2. **Validation**
   ```typescript
   const validation = await validateVideos(
     profileData.position,
     videoMetadata,
     videoFiles
   );
   ```

3. **Processing**
   ```typescript
   const processedVideos = await processVideos(videoFiles, videoMetadata);
   ```

4. **Error handling with cleanup**
   ```typescript
   catch (error) {
     await cleanupUploadedFiles(videoFiles);
     throw error;
   }
   ```

## Validation Rules

### 1. File Count Validation
- Must match metadata count
- Must match position requirements
- Office staff: 1-2 videos allowed
- Other positions: exact count required

### 2. Video Type Validation
- All required types must be present
- No duplicate types allowed
- Only allowed types for the position
- Pre-recorded interview mandatory for all staff

### 3. Duration Validation
- Maximum 3 minutes (180 seconds) per video
- Uses ffprobe to extract duration
- Validates each video individually

### 4. Format Validation
- Allowed formats: mp4, mov, avi, webm
- Handled by multer file filter

## Utility Functions

### `validateVideos(position, videoMetadata, videoFiles)`
Main validation function that checks all requirements.

**Returns:**
```typescript
{
  isValid: boolean,
  error?: string
}
```

### `processVideos(videoFiles, videoMetadata)`
Maps video files with metadata for database storage.

**Returns:**
```typescript
Array<{
  videoType: VideoType,
  url: string,
  duration: number,
  title?: string,
  description?: string,
  uploadedAt: Date
}>
```

### `cleanupUploadedFiles(files)`
Deletes uploaded files from local storage (use on validation failure).

### `getVideoDuration(filePath)`
Extracts video duration using `get-video-duration` npm package.

**Requires:** `get-video-duration` npm package (already installed in package.json)

**No system dependencies needed** - Pure Node.js solution!

## Database Schema

```typescript
videos: [
  {
    videoType: {
      type: String,
      enum: Object.values(VideoType),
      required: true,
    },
    url: { type: String, required: true },
    duration: { type: Number, required: true }, // in seconds
    title: { type: String },
    description: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
]
```

## Error Handling

All validation errors result in:
1. Immediate cleanup of uploaded files
2. Descriptive error message
3. HTTP 400 Bad Request status

Example error messages:
- "Mismatch: 3 files uploaded but 4 metadata entries provided"
- "Head Coach requires exactly 4 videos, received 3"
- "Missing required video type: Pre-recorded Interview"
- "Duplicate video types are not allowed"
- "Video 'Technical' exceeds maximum duration of 3 minutes (actual: 195s)"

## Installation Requirements

### Node.js Package (Already Installed)

The `get-video-duration` package is already added to your `package.json` and provides video duration extraction without any external dependencies.

```bash
# Already installed, but if needed:
pnpm add get-video-duration
```

**✅ No system dependencies required!**  
**✅ Works in Docker containers!**  
**✅ Pure Node.js solution!**

## TODO: Production Enhancements

1. **Cloud Storage Integration**
   - Upload videos to S3/Cloudinary/similar
   - Replace local file paths with cloud URLs
   - Implement video transcoding for optimization

2. **Video Processing**
   - Thumbnail generation
   - Multiple quality versions
   - Streaming optimization

3. **Additional Validations**
   - File size limits (already in multer config)
   - Video resolution checks
   - Audio track verification

4. **Progress Tracking**
   - Upload progress indicators
   - Async processing status
   - Webhook notifications

**Note:** Video duration extraction now uses the `get-video-duration` npm package, which works without any system dependencies. Perfect for Docker deployments!

## Testing

### Example Test Cases

```typescript
// 1. Valid Head Coach submission
{
  position: "Head Coach",
  videos: 4,
  types: ["Pre-recorded Interview", "Technical", "Tactical", "Game's Principals"]
}

// 2. Missing required video
{
  position: "Head Coach",
  videos: 3,
  types: ["Technical", "Tactical", "Game's Principals"]
  // Error: Missing required video type: Pre-recorded Interview
}

// 3. Office staff with optional methodology
{
  position: "Administrative Director",
  videos: 1,
  types: ["Pre-recorded Interview"]
  // Valid: Methodology is optional
}

// 4. Video too long
{
  position: "GK Coach",
  videos: 2,
  durations: [120, 200] // 2 minutes, 3.33 minutes
  // Error: Video exceeds maximum duration of 3 minutes
}
```

## Files Created/Modified

### New Files
1. `src/shared/constant/video.constant.ts` - Enums and interfaces
2. `src/shared/constant/videoRequirements.config.ts` - Position requirements
3. `src/shared/util/videoHelper.ts` - Validation and processing utilities
4. `src/modules/candidate/coachCan/CoachCan.videoController.ts` - Example controller

### Modified Files
1. `src/shared/middlewares/fileUploadHandler.ts` - Added video support
2. `src/modules/candidate/coachCan/coachCan.model.ts` - Updated schema

## Support

For issues or questions:
1. Check validation error messages (they're descriptive)
2. Verify ffmpeg is installed: `ffprobe -version`
3. Check file upload limits in multer config
4. Ensure video formats are supported
