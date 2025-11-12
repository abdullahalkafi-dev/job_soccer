import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

export type TCollageOrUniversityEmp = {
  collegeOrUniversityName: string;
  country: (typeof countryList)[number];
  address: string;
  founded: string;
  clubName: string;
  phoneNumber?: string;
  location: string;
  level: string;
  website: string;
  clubContact: string;
  clubDescription: string;
};
const collegeOrUniversityEmpSchema = new Schema<TCollageOrUniversityEmp>({
  collegeOrUniversityName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    enum: countryList,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  founded: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  clubContact: {
    type: String,
    required: true,
  },
  clubDescription: {
    type: String,
    required: true,
  },
});

export const CollegeOrUniversityEmp = model<TCollageOrUniversityEmp>(
  "CollegeOrUniversityEmp",
  collegeOrUniversityEmpSchema
);
