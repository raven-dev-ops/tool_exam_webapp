// lib/models/Assessment.js
import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: { type: Object },
  scores: { type: Object },
  created_at: Date,
});

export default mongoose.models.Assessment ||
  mongoose.model("Assessment", AssessmentSchema);
