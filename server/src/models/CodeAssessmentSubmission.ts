import mongoose, { Schema } from "mongoose";

const offenseSchema = new Schema({
  tabChange: {
    type: [{ problemId: Schema.Types.ObjectId, times: Number }],
    required: false,
  },

  copyPaste: {
    type: [{ problemId: Schema.Types.ObjectId, times: Number }],
    required: false,
  },
});

const ResultSchema = new mongoose.Schema({
  caseNo: { type: Number, required: true },
  caseId: { type: String, required: true },
  output: { type: String, required: false, default: " " },
  isSample: { type: Boolean, required: true },
  memory: { type: Number, required: true },
  time: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  console: { type: String },
});

const ProblemSubmissionSchema = new Schema({
  problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  results: { type: [ResultSchema], required: false },
});

const obtainedGradeSchema = new Schema({
  problem: {
    type: [
      {
        problemId: {
          type: Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
        obtainedMarks: { type: Number, required: true },
      },
    ],
    required: false,
  },

  total: { type: Number, required: true },
});

const CodeAssessmentSubmissionsSchema = new Schema({
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    required: false,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  offenses: { type: offenseSchema, required: false },
  submissions: { type: [ProblemSubmissionSchema], required: false },
  timer: { type: Number, required: true },
  sessionRewindUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  obtainedGrades: { type: obtainedGradeSchema, required: false },
  cheatingStatus: {
    type: String,
    enum: ["No Copying", "Light Copying", "Heavy Copying"],
    required: false,
  },
});

const CodeAssessmentSubmissions = mongoose.model(
  "CodeAssessmentSubmissions",
  CodeAssessmentSubmissionsSchema
);

export default CodeAssessmentSubmissions;
