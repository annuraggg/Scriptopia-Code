import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Mongoose schema for PlacementGroup
 * Synced with interfaces as of: 2025-04-06 14:19:31 UTC
 */

const academicYearSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const ruleSchema = new Schema(
  {
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const placementGroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    academicYear: {
      type: academicYearSchema,
      required: true,
      index: true,
    },
    departments: [{ type: mongoose.Schema.Types.ObjectId }],
    purpose: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    criteria: {
      type: [ruleSchema],
      default: [],
    },
    accessType: {
      type: String,
      enum: ["public", "private"],
      required: true,
      default: "private",
    },
    candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    pendingCandidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
placementGroupSchema.index({ name: 1 });
placementGroupSchema.index({ "academicYear.start": 1, "academicYear.end": 1 });
placementGroupSchema.index({ expiryDate: 1 });
placementGroupSchema.index({ institute: 1, archived: 1 });

// Virtual: isActive
placementGroupSchema.virtual("isActive").get(function () {
  return !this.archived && new Date(this.expiryDate) > new Date();
});

const PlacementGroup = mongoose.model("PlacementGroup", placementGroupSchema);
export default PlacementGroup;
