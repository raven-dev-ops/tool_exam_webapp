// lib/db.js
import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not set in environment variables");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongoose) => {
      console.log("Connected to MongoDB ->", mongoose.connection.name);
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
