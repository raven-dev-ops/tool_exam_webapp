import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      // For security, we do NOT reveal if email doesn't exist
      // Just return success so attackers can’t detect valid emails
      return NextResponse.json({ success: true });
    }

    // 1) Generate token & expiry
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour from now

    // 2) Store in DB
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // 3) Send email with nodemailer (example)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: false, // or true if using 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM, // e.g. "Your App <no-reply@yourapp.com>"
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset.</p>
        <p>Click here to set a new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in reset-password request route:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
