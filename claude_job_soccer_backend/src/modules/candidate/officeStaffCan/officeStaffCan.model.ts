import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

enum TPosition {
  ADMINISTRATIVE_DIRECTOR = "Administrative Director",
  COMMUNITY_MANAGER = "Community Manager",
  DATA_ANALYST = "Data Analyst",
  DIGITAL_MARKETING = "Digital Marketing",
  MEDICAL_STAFF = "Medical Staff",
  PERFORMANCE_STAFF = "Performance Staff",
  EQUIPMENT_STAFF = "Equipment Staff",
  SALES = "Sales",
}

export type TOfficeStaffCan = {
  dateOfBirth: Date;
  placeOfBirth: string;
  country: (typeof countryList)[number];
  nationality: string;
  phoneNumber: string;
  position: TPosition;
  languages: string;
  availability: string;
  licensesNumber: string;
  agent: string;
  socialMedia: string;
  videos: {
    videoType: string; // From VideoType enum
    url: string;
    duration: number; // in seconds
    title?: string;
    description?: string;
    uploadedAt?: Date;
  }[];
};
const officeStaffSchema = new Schema<TOfficeStaffCan>(
  {
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    availability: { type: String, required: true, trim: true },
    country: {
      type: String,
      enum: countryList,
      required: true,
    },
    licensesNumber: { type: String, required: true, trim: true },
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

export const OfficeStaffCan = model<TOfficeStaffCan>(
  "OfficeStaffCan",
  officeStaffSchema
);
