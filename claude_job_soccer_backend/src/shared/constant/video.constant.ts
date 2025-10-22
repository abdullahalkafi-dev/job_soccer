// Video Type Enum
export enum VideoType {
  // Mandatory for staff
  PRE_RECORDED_INTERVIEW = "Pre-recorded Interview",

  // Technical/Tactical
  TECHNICAL = "Technical",
  TACTICAL = "Tactical",
  GAME_PRINCIPALS = "Game's Principals",

  // Methodologies
  METHODOLOGY = "Methodology",
  TRAINING_METHODOLOGY = "Training Methodology",
  SCOUTING_METHODOLOGY = "Scouting Methodology",
  YOUTH_DEVELOPMENT_METHODOLOGY = "Youth Development Methodology",
  CLUB_PHILOSOPHY_METHODOLOGY = "Club's Philosophy & Methodology",
  PLAYER_RECRUITMENT_METHODOLOGY = "Player Recruitment Methodology",
  COACHING_RECRUITMENT_METHODOLOGY = "Coaching Recruitment Methodology",

  // Players only
  HIGHLIGHTS = "Highlights",
}

// Position Enum (matching your existing enum)
export enum TPosition {
  HEAD_COACH = "Head Coach",
  ASSISTANT_COACH = "Assistant Coach",
  GK_COACH = "GK Coach",
  MENTAL_COACH = "Mental Coach",
  VIDEO_ANALYST_COACH = "Video Analyst Coach",
  SPECIFIC_OFFENSIVE_COACH = "Specific Offensive Coach",
  SPECIFIC_DEFENSIVE_COACH = "Specific Defensive Coach",
  SPECIFIC_TECHNICAL_COACH = "Specific Technical Coach",
  SCOUT = "Scout",
  TECHNICAL_DIRECTOR = "Technical Director",
  ACADEMY_DIRECTOR = "Academy Director",
  DIRECTOR_OF_COACHING = "Director of Coaching",
}

// Office Staff Position Enum
export enum OfficeStaffPosition {
  ADMINISTRATIVE_DIRECTOR = "Administrative Director",
  COMMUNITY_MANAGER = "Community Manager",
  DATA_ANALYST = "Data Analyst",
  DIGITAL_MARKETING = "Digital Marketing",
  MEDICAL_STAFF = "Medical Staff",
  PERFORMANCE_STAFF = "Performance Staff",
  EQUIPMENT_STAFF = "Equipment Staff",
  SALES = "Sales",
}

// Video Metadata Interface
export interface IVideoMetadata {
  type: VideoType;
  title?: string;
  description?: string;
}

// Video Document Interface (for DB storage)
export interface IVideo {
  videoType: VideoType;
  url: string;
  duration: number; // in seconds
  title?: string;
  description?: string;
  uploadedAt?: Date;
}

// Video Requirements Interface
export interface IVideoRequirement {
  type: VideoType;
  required: boolean;
}

export interface IPositionVideoConfig {
  position: string;
  totalVideos: number;
  maxDuration: number; // in seconds
  requiredVideoTypes: IVideoRequirement[];
  forbiddenVideoTypes?: VideoType[];
}

// Video Validation Result
export interface IVideoValidationResult {
  isValid: boolean;
  error?: string;
}
