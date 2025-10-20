import { Types } from "mongoose";
import { CandidateRole, EmployerRole } from "../user/user.interface";
export enum LoginProvider {
  LINKEDIN = "linkedin",
  EMAIL = "email",
}

export type TAuth = {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  loginProvider: LoginProvider;
  createdAt: Date;
  updatedAt: Date;
};

export type TVerifyEmail = {
  email: string;
  oneTimeCode: string;
};

export type TLoginData = {
  email: string;
  password: string;
  loginProvider: LoginProvider;
  role?: CandidateRole | EmployerRole;
  firstName?: string;
  lastName?: string;
};
