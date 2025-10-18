import { Types } from "mongoose";
export enum LoginProvider {
  LINKEDIN = "linkedin",
  EMAIL = "email",
}

export type TAuth = {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  loginProvider: LoginProvider;
  otp: string;
  otpExpireAt: Date;
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
  phnNum: string;
  loginStatus?: string;
  fcmToken?: string;
};
