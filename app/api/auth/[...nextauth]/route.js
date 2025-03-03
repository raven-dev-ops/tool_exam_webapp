import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export const authOptions = {
  providers: [
    // Manual Credentials (optional)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with that email.");
        }
        // Compare hashed_password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashed_password || ""
        );
        if (!isValid) {
          throw new Error("Invalid password.");
        }
        return { id: user._id.toString(), email: user.email };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            hashed_password: null,
          });
        }
      }
      return true;
    },
    async session({ session }) {
      if (session?.user?.email) {
        await connectDB();
        const userDoc = await User.findOne({ email: session.user.email });
        if (userDoc) {
          session.user.id = userDoc._id.toString();
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Create and export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
