import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  hashed_password: {
    type: String,
    default: null,
  },
  // Extra fields
  firstName: { type: String },
  lastName: { type: String },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    default: "Male",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Token fields for password resets
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
