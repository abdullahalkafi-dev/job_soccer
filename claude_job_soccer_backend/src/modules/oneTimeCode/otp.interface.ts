import { Types } from "mongoose";

export type TOneTimeCode = {
  userId: Types.ObjectId;
  reason: "account_verification" | "password_reset";
  oneTimeCodeHash: string;
  expireAt: Date;
};
export type TCreateOneTimeCode = {
  userId: string;
  reason: "account_verification" | "password_reset";
  oneTimeCode: string;
  expireAt: Date;
};