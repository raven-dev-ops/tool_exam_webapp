// lib/models/Question.js

import mongoose from "mongoose";

const QuestionItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
});

const QuestionSetSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    description: { type: String, default: "" },
    questions: { type: [QuestionItemSchema], default: [] },
  },
  { collection: "questions" }
);

export default mongoose.models.QuestionSet
  || mongoose.model("QuestionSet", QuestionSetSchema);
