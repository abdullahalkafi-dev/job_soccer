import { Types } from "mongoose";

export type TOneTimeCode = {
  userId: Types.ObjectId;
  reason: "account_verification" | "password_reset";
  oneTimeCodeHash: string;
  expireAt: Date;
};
