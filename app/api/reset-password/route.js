import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Check token expiry
    if (Date.now() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.hashed_password = hashed;

    // Clear out token fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in reset-password update route:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
