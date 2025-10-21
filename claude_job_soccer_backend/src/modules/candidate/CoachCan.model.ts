import { model, Schema } from "mongoose";
import { countryList } from "../../shared/constant/country.constant";

enum TPosition {
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

export type TCoachCan = {
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  phoneNumber: string;
  currentClub: string;
  position: TPosition; 
  boyOrGirl: string;
  category: string;
  agent: string;
  availability: string;
  league: string;
  country: (typeof countryList)[number];
  socialMedia: string;
  licensesNumber: string;
  video: [
    {
      title: string;
      url: string;
    }
  ];
};

const coachCanSchema = new Schema<TCoachCan>(
  {
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    currentClub: { type: String, required: true, trim: true },
    position: {
      type: String,
      enum: Object.values(TPosition),
      required: true,
    },
    boyOrGirl: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    agent: { type: String, required: true, trim: true },
    availability: { type: String, required: true, trim: true },
    league: { type: String, required: true, trim: true },
    country: {
      type: String,
      enum: countryList,
      required: true,
    },
    socialMedia: { type: String, required: true, trim: true },
    licensesNumber: { type: String, required: true, trim: true },
    video: [
      {
        title: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CoachCan = model<TCoachCan>("CoachCan", coachCanSchema);
