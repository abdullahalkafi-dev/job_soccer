import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

enum TPosition {
  HEAD_COACH = "Head Coach",
  ASSISTANT_COACH = "Assistant Coach",
  GK_COACH = "GK Coach",
  MENTAL_COACH = "Mental Coach",
  VIDEO_ANALYST_COACH = "Video Analyst Coach",
  SPECIFIC_FORWARD_COACH = "Specific Forward Coach",
  SPECIFIC_DEFENSIVE_COACH = "Specific Defensive Coach",
  SPECIFIC_TECHNICAL_COACH = "Specific Technical Coach",
  SCOUT = "Scout",
  TECHNICAL_DIRECTOR = "Technical Director",
  ACADEMY_DIRECTOR = "Academy Director",
  DIRECTOR_OF_COACHING = "Director of Coaching",
}

export type TOnFieldStaffCan = {
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  phoneNumber: string;
  currentClub: string;
  availability: string;
  league: string;
  gender: "male" | "female";
  country: (typeof countryList)[number];
  licensesNumber: string;
  category: string;
  socialMedia: string;
  agent: string;
  position: TPosition;
  videos: {
    videoType: string; // From VideoType enum
    url: string;
    duration: number; // in seconds
    title?: string;
    description?: string;
    uploadedAt?: Date;
  }[];
};
const onFieldStaffCanSchema = new Schema<TOnFieldStaffCan>(
  {
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    currentClub: { type: String, required: true, trim: true },
    availability: { type: String, required: true, trim: true },
    league: { type: String, required: true, trim: true },
    country: {
      type: String,
      enum: countryList,
      required: true,
    },
    gender: { type: String, enum: ["male", "female"], required: true },
    licensesNumber: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    socialMedia: { type: String, required: true, trim: true },
    agent: { type: String, required: true, trim: true },
    position: {
      type: String,
      enum: Object.values(TPosition),
      required: true,
    },
    videos: [
      {
        videoType: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        duration: { type: Number, required: true }, // in seconds
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OnFieldStaffCan = model<TOnFieldStaffCan>(
  "OnFieldStaffCan",
  onFieldStaffCanSchema
);
