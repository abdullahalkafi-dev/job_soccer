import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

export type TAmateurClubEmp = {
  clubName: string;
  country: (typeof countryList)[number];
  address: string;
  founded: string;
  nationality: string;
  location: string;
  level: string;
  website: string;
  phoneNumber?: string;
  clubContact: string;
  clubDescription: string;
};

const amateurClubEmpSchema = new Schema<TAmateurClubEmp>({
  clubName: {
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
  nationality: {
    type: String,
    required: true,
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
  phoneNumber: {
    type: String,
    required: false,
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

export const AmateurClubEmp = model<TAmateurClubEmp>(
  "AmateurClubEmp",
  amateurClubEmpSchema
);
