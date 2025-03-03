"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // for redirection

export default function ResetPasswordTokenPage({ params }) {
  const { token } = params; // from [token] dynamic route
  const router = useRouter();

  // Local state
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // Fade states
  const [fadeInBg, setFadeInBg] = useState(false);
  const [fadeInTitle, setFadeInTitle] = useState(false);

  useEffect(() => {
    // Timed fade-ins
    const tBg = setTimeout(() => setFadeInBg(true), 1500);
    const tTitle = setTimeout(() => setFadeInTitle(true), 2000);

    return () => {
      clearTimeout(tBg);
      clearTimeout(tTitle);
    };
  }, []);

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to reset password");
      }

      // If success => redirect to /signin?resetSuccess=1
      router.push("/signin?resetSuccess=1");
    } catch (err) {
      setError(err.message);
    }
  }

  // Shared input & button style
  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "0.8rem",
    fontSize: "1rem",
    margin: "0.5rem auto",
    borderRadius: "4px",
    border: "1px solid #ccc",
    outline: "none",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "0.8rem 1.5rem",
    fontSize: "1.2rem",
    margin: "0.5rem auto",
    display: "block",
    border: "2px solid #fff",
    backgroundColor: "transparent",
    color: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    textAlign: "center",
  };

  return (
    <>
      {/* Global styling => allow scrolling */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: black;
          font-family: "Trebuchet MS", sans-serif;
          color: #fff;
          /* Let user scroll on smaller devices if needed */
          overflow-y: auto;
        }
      `}</style>

      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          backgroundColor: "black",
        }}
      >
        {/* 1) Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          src="/videos/homepage.mp4"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        {/* 2) Fade overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 2,
            opacity: fadeInBg ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />

        {/* 3) Centered content */}
        <div
          style={{
            position: "relative",
            zIndex: 4,
            width: "100%",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          {/* Container => maxWidth & horizontal padding */}
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <h1
              style={{
                fontSize: "3rem",
                marginBottom: "2rem",
                opacity: fadeInTitle ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
              className="resetHeading"
            >
              Enter New Password
            </h1>

            {/* Form container */}
            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: "2rem",
                borderRadius: "8px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <p style={{ marginBottom: "1rem" }}>
                Please create and confirm a new password.
              </p>

              {/* New password */}
              <input
                type="password"
                required
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />

              {/* Confirm password */}
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={inputStyle}
              />

              {/* Submit button */}
              <button type="submit" style={buttonStyle}>
                Update Password
              </button>

              {/* Show error if any */}
              {error && (
                <p style={{ marginTop: 10, color: "red" }}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Optional smaller heading on mobile */}
      <style jsx>{`
        @media (max-width: 600px) {
          .resetHeading {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
}
