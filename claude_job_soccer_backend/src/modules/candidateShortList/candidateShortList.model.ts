import { model, Schema } from "mongoose";
import { TCandidateShortList } from "./candidateShortList.interface";

const candidateShortListSchema = new Schema<TCandidateShortList>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    candidateRole: {
      type: String,
      required: true,
      index: true,
    },
    shortlistedById: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shortlistedByType: {
      type: String,
      enum: ["candidate", "employer"],
      required: true,
      index: true,
    },
    shortlistedByRole: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

candidateShortListSchema.index(
  { shortlistedById: 1, candidateId: 1 },
  { unique: true }
);

candidateShortListSchema.index({ candidateId: 1, createdAt: -1 });
candidateShortListSchema.index({ shortlistedById: 1, createdAt: -1 });

export const CandidateShortList = model<TCandidateShortList>(
  "CandidateShortList",
  candidateShortListSchema
);
