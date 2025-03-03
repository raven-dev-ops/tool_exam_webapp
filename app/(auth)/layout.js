// app/(auth)/layout.js
"use client";
export const dynamic = "force-dynamic";

/**
 * Minimal layout that won't pre-render child routes
 * (like /signin or /signup) that might use NextAuth.
 */
export default function AuthLayout({ children }) {
  return <>{children}</>;
}
