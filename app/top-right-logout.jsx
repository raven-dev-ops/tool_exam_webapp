"use client";

import { useSession, signOut } from "next-auth/react";

export default function TopRightLogout() {
  const { data: session, status } = useSession();

  // If session is still loading, or user is not signed in, hide the button
  if (status === "loading" || !session) return null;

  async function handleLogout() {
    // Sign out & redirect to homepage
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      <button
        onClick={handleLogout}
        style={{
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "#fff",
          cursor: "pointer",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Log Out
      </button>
    </div>
  );
}
