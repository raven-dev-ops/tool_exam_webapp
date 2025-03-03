"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  // Fade states
  const [fadeInBg, setFadeInBg] = useState(false);
  const [fadeInTitle, setFadeInTitle] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Hover states for the two buttons
  const [hoverBack, setHoverBack] = useState(false);
  const [hoverSubmit, setHoverSubmit] = useState(false);

  useEffect(() => {
    // Timed fade-ins
    const tBg = setTimeout(() => setFadeInBg(true), 1500);
    const tTitle = setTimeout(() => setFadeInTitle(true), 2000);

    return () => {
      clearTimeout(tBg);
      clearTimeout(tTitle);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to request password reset");
      }
      setMessage("Password reset link sent (if an account exists). Check your email.");
      setEmail("");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleBack() {
    router.back();
  }

  // Base button style
  const baseButtonStyle = {
    padding: "0.8rem 1.5rem",
    fontSize: "1.2rem",
    border: "2px solid #fff",
    backgroundColor: "transparent",
    color: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    textAlign: "center",
  };

  // Input style
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

  return (
    <>
      {/* Global style => allow scrolling, black bg */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: black;
          font-family: "Trebuchet MS", sans-serif;
          color: #fff;
          /* Let page scroll if needed */
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
        {/* Background Video */}
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

        {/* CPC logo top-left */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 9,
          }}
        >
          <a
            href="https://colonialkc.org/"
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-block", cursor: "pointer" }}
          >
            <img
              src="/images/cpc-logo-white.png"
              alt="Colonial KC Logo"
              style={{
                width: "144px",
                transition: "transform 0.2s ease",
              }}
            />
          </a>
        </div>

        {/* Fade overlay */}
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

        {/* Centered container */}
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
            textAlign: "center",
            padding: "1rem", // padding around edges
            boxSizing: "border-box",
          }}
        >
          {/* Container => maxWidth with padding => no text overflow */}
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              margin: "0 auto",
              boxSizing: "border-box",
            }}
          >
            <h1
              style={{
                fontSize: "3rem",
                marginBottom: "2rem",
                opacity: fadeInTitle ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
              className="reset-title"
            >
              Reset Password
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
              <p>Enter your email to receive a password reset link.</p>

              {/* Email input (stacked) */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />

              {/* Buttons row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                {/* BACK button */}
                <button
                  type="button"
                  onClick={handleBack}
                  onMouseEnter={() => setHoverBack(true)}
                  onMouseLeave={() => setHoverBack(false)}
                  style={{
                    ...baseButtonStyle,
                    transform: hoverBack ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  Back
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  onMouseEnter={() => setHoverSubmit(true)}
                  onMouseLeave={() => setHoverSubmit(false)}
                  style={{
                    ...baseButtonStyle,
                    transform: hoverSubmit ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  Send
                </button>
              </div>

              {/* Success or error messages */}
              {message && (
                <p style={{ marginTop: 10, color: "lightgreen" }}>{message}</p>
              )}
              {error && <p style={{ marginTop: 10, color: "red" }}>{error}</p>}
            </form>
          </div>
        </div>
      </div>

      {/* Optional smaller heading on mobile */}
      <style jsx>{`
        @media (max-width: 600px) {
          .reset-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
}
