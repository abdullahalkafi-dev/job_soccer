import { model, Schema } from "mongoose";
import { TAuth } from "./auth.interface";

const authSchema = new Schema<TAuth>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    loginProvider: {
      type: String,
      enum: ["linkedin", "email"],
      required: true,
    },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);




export const Auth = model<TAuth>("Auth", authSchema);
