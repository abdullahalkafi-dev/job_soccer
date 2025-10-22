import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

enum TNationalTeamCategory {
  U14 = "U14",
  U15 = "U15",
  U16 = "U16",
  U17 = "U17",
  U18 = "U18",
  U19 = "U19",
  U20 = "U20",
  U21 = "U21",
}
enum TPosition {
  GK = "GK",
  CENTRAL_BACK = "Central back",
  LEFT_BACK = "Left back",
  RIGHT_BACK = "Right back",
  DEFENSIVE_MIDFIELDER = "Defensive midfielder",
  OFFENSIVE_MIDFIELDER = "Offensive midfielder",
  RIGHT_WINGER = "Right winger",
  LEFT_WINGER = "Left winger",
  FORWARD = "Forward",
  STRIKER = "Striker",
}
enum TAvailability {
  NOW = "Now",
  SOON = "Soon",
  LATER = "Later",
}

enum TFoot {
  RIGHT = "Right",
  LEFT = "Left",
  BOTH = "Both",
}

export type TAmateurPlayerCan = {
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  phoneNumber: string;
  gender: string;
  height: { size: number; unit: string };
  nationalTeamCategory: TNationalTeamCategory;
  currentClub: string;
  division: string;
  position: TPosition;
  agent: string;
  country: (typeof countryList)[number];
  availability: TAvailability;
  weight: { size: number; unit: string };
  nationalTeamGames: string;
  socialMedia: string;
  foot: TFoot;
  teamsJoined: string;
  contractExpires: string;
  videos: [
    {
      title: string;
      url: string;
    }
  ];
};

const amateurPlayerCanSchema = new Schema<TAmateurPlayerCan>(
  {
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    height: {
      size: { type: Number, required: true },
      unit: { type: String, required: true, enum: ["cm", "m", "in", "ft"] },
    },
    nationalTeamCategory: {
      type: String,
      enum: Object.values(TNationalTeamCategory),
      required: true,
    },
    currentClub: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true },
    position: {
      type: String,
      enum: Object.values(TPosition),
      required: true,
    },
    agent: { type: String, required: true, trim: true },
    country: {
      type: String,
      enum: countryList,
      required: true,
    },
    availability: {
      type: String,
      enum: Object.values(TAvailability),
      required: true,
    },
    weight: {
      size: { type: Number, required: true },
      unit: { type: String, required: true, enum: ["kg", "lb"] },
    },
    nationalTeamGames: { type: String, required: true, trim: true },
    socialMedia: { type: String, required: true, trim: true },
    foot: {
      type: String,
      enum: Object.values(TFoot),
      required: true,
    },
    teamsJoined: { type: String, required: true, trim: true },
    contractExpires: { type: String, required: true, trim: true },
    videos: [
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

export const AmateurPlayerCan = model<TAmateurPlayerCan>(
  "AmateurPlayerCan",
  amateurPlayerCanSchema
);
