import { model, Schema } from "mongoose";
import { TAuth } from "./auth.interface";

const authSchema = new Schema<TAuth>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    loginProvider: {
      type: String,
      enum: ["EMAIL", "LINKEDIN"],
      required: true,
    },
    otp: { type: String, required: false },
    otpExpireAt: { type: Date, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);




export const Auth = model<TAuth>("Auth", authSchema);
