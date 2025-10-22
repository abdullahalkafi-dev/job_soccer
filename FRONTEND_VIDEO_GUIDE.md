# Frontend Video Upload Guide - Quick Reference

## 📤 How to Send Data

### FormData Structure

```javascript
const formData = new FormData();

// 1. Profile Data (as JSON string)
formData.append('data', JSON.stringify({
  // Required fields
  firstName: "John",
  lastName: "Doe",
  position: "Head Coach", // IMPORTANT: This determines video requirements!
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

// 2. Video Metadata (as JSON array string)
// IMPORTANT: Order must match video files!
formData.append('videoMeta', JSON.stringify([
  {
    type: "Pre-recorded Interview",  // Must match exactly
    title: "Introduction",           // Optional
    description: "My background"     // Optional
  },
  {
    type: "Technical",
    title: "Technical Skills"
  },
  // ... more videos
]));

// 3. Video Files (in SAME ORDER as metadata)
formData.append('videos', videoFile1);  // Matches index 0 in videoMeta
formData.append('videos', videoFile2);  // Matches index 1 in videoMeta
formData.append('videos', videoFile3);  // Matches index 2 in videoMeta
formData.append('videos', videoFile4);  // Matches index 3 in videoMeta
```

## 🎯 Video Types by Position

### Position: "Head Coach" or "Assistant Coach" → 4 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Technical" },
  { type: "Tactical" },
  { type: "Game's Principals" }
]
```

### Position: "GK Coach" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Methodology" }
]
```

### Position: "Mental Coach" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Methodology" }
]
```

### Position: "Video Analyst Coach" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Methodology" }
]
```

### Position: "Specific Offensive Coach" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Training Methodology" }
]
```

### Position: "Specific Defensive Coach" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Training Methodology" }
]
```

### Position: "Specific Technical Coach" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Training Methodology" }
]
```

### Position: "Scout" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Scouting Methodology" }
]
```

### Position: "Technical Director" → 3 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Club's Philosophy & Methodology" },
  { type: "Player Recruitment Methodology" }
]
```

### Position: "Academy Director" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Youth Development Methodology" }
]
```

### Position: "Director of Coaching" → 2 Videos
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Coaching Recruitment Methodology" }
]
```

### Office Staff Positions → 1 or 2 Videos
**Positions:** Administrative Director, Community Manager, Data Analyst, Digital Marketing, Medical Staff, Performance Staff, Equipment Staff, Sales

**Option 1 (Minimum):**
```javascript
[
  { type: "Pre-recorded Interview" }  // Mandatory
]
```

**Option 2 (With Methodology):**
```javascript
[
  { type: "Pre-recorded Interview" },  // Mandatory
  { type: "Methodology" }              // Optional
]
```

## ⚠️ Important Rules

### ✅ DO
- Send field name as `'videos'` for all video files
- Send `'data'` as stringified JSON
- Send `'videoMeta'` as stringified JSON array
- Keep videos and metadata in same order
- Use exact video type strings (case-sensitive)
- Ensure each video is ≤ 3 minutes
- Use supported formats: `.mp4`, `.mov`, `.avi`, `.webm`
- Always include "Pre-recorded Interview" for staff

### ❌ DON'T
- Don't use different field names for each video type
- Don't send more/fewer videos than required
- Don't include duplicate video types
- Don't include "Pre-recorded Interview" for players (if applicable)
- Don't exceed 3-minute limit per video
- Don't send unsupported video formats

## 📝 Complete Example

```javascript
// User selects position
const selectedPosition = "Head Coach";

// Prepare video data
const videos = [
  { file: interviewVideoFile, type: "Pre-recorded Interview", title: "My Story" },
  { file: technicalVideoFile, type: "Technical", title: "Technical Analysis" },
  { file: tacticalVideoFile, type: "Tactical", title: "Tactical Vision" },
  { file: gameVideoFile, type: "Game's Principals", title: "Game Philosophy" }
];

// Build FormData
const formData = new FormData();

// Profile data
formData.append('data', JSON.stringify({
  firstName: formValues.firstName,
  lastName: formValues.lastName,
  position: selectedPosition,
  // ... other fields
}));

// Video metadata
formData.append('videoMeta', JSON.stringify(
  videos.map(v => ({
    type: v.type,
    title: v.title,
    description: v.description
  }))
));

// Video files
videos.forEach(v => {
  formData.append('videos', v.file);
});

// Send request
try {
  const response = await fetch('/api/coaches', {
    method: 'POST',
    body: formData
    // Don't set Content-Type header - browser will set it with boundary
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Coach created:', result.data);
  } else {
    console.error('Error:', result.message);
  }
} catch (error) {
  console.error('Upload failed:', error);
}
```

## 🚨 Common Errors and Solutions

### Error: "Mismatch: 3 files uploaded but 4 metadata entries provided"
**Solution:** Ensure same number of files and metadata entries

### Error: "Head Coach requires exactly 4 videos, received 3"
**Solution:** Check position requirements and upload correct number

### Error: "Missing required video type: Pre-recorded Interview"
**Solution:** Always include Pre-recorded Interview for staff positions

### Error: "Duplicate video types are not allowed"
**Solution:** Don't upload same type twice

### Error: "Video 'Technical' exceeds maximum duration of 3 minutes"
**Solution:** Trim video to max 3 minutes (180 seconds)

### Error: "Only .mp4, .mov, .avi, .webm video files supported"
**Solution:** Convert video to supported format

## 🎬 Video Type Reference (Copy-Paste Ready)

```javascript
// All possible video types (use exact strings)
const VIDEO_TYPES = {
  PRE_RECORDED_INTERVIEW: "Pre-recorded Interview",
  TECHNICAL: "Technical",
  TACTICAL: "Tactical",
  GAME_PRINCIPALS: "Game's Principals",
  METHODOLOGY: "Methodology",
  TRAINING_METHODOLOGY: "Training Methodology",
  SCOUTING_METHODOLOGY: "Scouting Methodology",
  YOUTH_DEVELOPMENT_METHODOLOGY: "Youth Development Methodology",
  CLUB_PHILOSOPHY_METHODOLOGY: "Club's Philosophy & Methodology",
  PLAYER_RECRUITMENT_METHODOLOGY: "Player Recruitment Methodology",
  COACHING_RECRUITMENT_METHODOLOGY: "Coaching Recruitment Methodology",
};
```

## 📋 Validation Checklist

Before submitting, verify:
- [ ] Profile data includes `position` field
- [ ] Number of videos matches position requirement
- [ ] Video metadata array has same length as files
- [ ] "Pre-recorded Interview" is included (for staff)
- [ ] All video types are from allowed list for that position
- [ ] No duplicate video types
- [ ] Each video is ≤ 3 minutes
- [ ] All videos are in supported format
- [ ] Field names are exactly: `data`, `videoMeta`, `videos`

## 🔧 Testing Tips

```javascript
// Validate video duration before upload (client-side)
const getVideoDuration = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// Usage
const duration = await getVideoDuration(videoFile);
if (duration > 180) {
  alert('Video must be 3 minutes or less!');
}
```

## 📞 Need Help?

Check the detailed backend guide: `VIDEO_IMPLEMENTATION_GUIDE.md`
