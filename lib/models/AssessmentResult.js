// lib/models/AssessmentResult.js
import mongoose from "mongoose";

const AssessmentResultSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  gender: { type: String },
  userEmail: { type: String, required: true },
  answers: {
    // Mixed allows any object/array structure for answers.
    // Or you can specify more structure if needed.
    type: mongoose.Schema.Types.Mixed,
  },
  scores: {
    // Another mixed field for total, average, categoryScores, etc.
    type: mongoose.Schema.Types.Mixed,
  },
  summaryText: { type: String, default: "" },
  // (Optional) If you're associating this assessment with a User model:
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  date: { type: Date, default: Date.now },
});

// If the "AssessmentResult" model already exists, use it;
// otherwise, create a new model named "AssessmentResult"
const AssessmentResult =
  mongoose.models.AssessmentResult ||
  mongoose.model("AssessmentResult", AssessmentResultSchema);

export default AssessmentResult;
