import mongoose, { Schema } from "mongoose";

const appliedPostingSchema = new Schema(
  {
    posting: { type: Schema.Types.ObjectId, required: true, ref: "Posting" },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    disqualifiedStage: { type: Number },
    disqualifiedReason: { type: String },
    scores: [
      {
        stageId: { type: Schema.Types.ObjectId, required: true },
        score: { type: Number },
      },
    ],

    status: {
      type: String,
      enum: ["applied", "inprogress", "rejected", "hired"],
      default: "applied",
    },
  },
  { timestamps: true }
);

const AppliedPosting = mongoose.model("AppliedPosting", appliedPostingSchema);
export default AppliedPosting;
