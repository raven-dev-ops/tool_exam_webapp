import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/lib/models/User";  // adjust if needed
import { connectDB } from "@/lib/db";  // adjust if needed

export async function POST(request) {
  try {
    // 1) Connect to DB
    await connectDB();

    // 2) Parse request body
    const { firstName, lastName, gender, email, password } = await request.json();

    // 3) Validate fields
    if (!firstName || !lastName || !gender || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4) Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // 5) Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6) Create user in the database
    //    NOTE: we store firstName, lastName, gender in separate fields
    const newUser = await User.create({
      email,
      hashed_password: hashedPassword,
      firstName,
      lastName,
      gender,
    });

    // 7) Respond with success
    return NextResponse.json(
      {
        message: "User created successfully",
        userId: newUser._id,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in /api/register:", error);
    return NextResponse.json(
      { error: "Server error, please try again" },
      { status: 500 }
    );
  }
}
