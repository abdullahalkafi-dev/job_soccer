import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

export type THighSchoolEmp = {
  highSchoolName: string;
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
const highSchoolEmpSchema = new Schema<THighSchoolEmp>({
  highSchoolName: {
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
  clubName: {
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

export const HighSchoolEmp = model<THighSchoolEmp>(
  "HighSchoolEmp",
  highSchoolEmpSchema
);
