import { model, Schema } from "mongoose";
import { TOneTimeCode } from "./otp.interface";

const oneTimeCodeSchema = new Schema<TOneTimeCode>({
  userId:  { type: Schema.Types.ObjectId,ref:"user", required: true },
  reason: {
    type: String,
    enum: ["account_verification", "password_reset"],
    required: true,
  },
  oneTimeCodeHash: { type: String, required: true },
  expireAt: { type: Date, required: true },
});

oneTimeCodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
oneTimeCodeSchema.index({ userId: 1, reason: 1 });
oneTimeCodeSchema.index({ userId: 1 });
export const OneTimeCode = model<TOneTimeCode>(
  "OneTimeCode",
  oneTimeCodeSchema
);
