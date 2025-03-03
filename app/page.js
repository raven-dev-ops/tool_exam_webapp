"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  // Force logout if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      signOut({ redirect: false }); // sign user out without redirect
    }
  }, [status]);

  // Fade states
  const [fadeInBg, setFadeInBg] = useState(false);
  const [fadeInTitle, setFadeInTitle] = useState(false);
  const [fadeInButtons, setFadeInButtons] = useState(false);

  // Hover states
  const [hoverLogo, setHoverLogo] = useState(false);
  const [hoverSignUp, setHoverSignUp] = useState(false);
  const [hoverSignIn, setHoverSignIn] = useState(false);

  useEffect(() => {
    // Timed fade-ins
    const tBg = setTimeout(() => setFadeInBg(true), 1500);
    const tTitle = setTimeout(() => setFadeInTitle(true), 2000);
    const tBtns = setTimeout(() => setFadeInButtons(true), 3500);

    return () => {
      clearTimeout(tBg);
      clearTimeout(tTitle);
      clearTimeout(tBtns);
    };
  }, []);

  // Unified button style
  const buttonStyle = {
    display: "inline-block",
    padding: "0.8rem 1.5rem",
    fontSize: "1.86rem",
    fontFamily: "'Trebuchet MS', sans-serif",
    lineHeight: "1.2",
    textDecoration: "none",
    border: "2px solid #fff",
    color: "#fff",
    backgroundColor: "transparent",
    transition: "transform 0.2s ease",
    cursor: "pointer",
    width: "200px",
    textAlign: "center",
  };

  return (
    <>
      {/* Basic global styling => allow scrolling & black background */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: black;
          color: #fff;
          font-family: "Trebuchet MS", sans-serif;
          /* Let mobile scale & scroll if needed */
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
        {/* 1) Video background */}
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
            pointerEvents: "none",
          }}
        />

        {/* 3) Centered content container */}
        <div
          style={{
            position: "relative",
            zIndex: 4,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#fff",
          }}
        >
          {/* We add an extra container for maxWidth & padding */}
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              padding: "0 1rem", // horizontal padding
              boxSizing: "border-box",
            }}
          >
            {/* Colonial KC logo => stacked at top */}
            <div
              style={{
                marginBottom: "2rem",
                transition: "opacity 1s ease-in-out",
                opacity: fadeInTitle ? 1 : 0,
              }}
            >
              <a
                href="https://colonialkc.org/"
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block", cursor: "pointer" }}
                onMouseEnter={() => setHoverLogo(true)}
                onMouseLeave={() => setHoverLogo(false)}
              >
                <img
                  src="/images/cpc-logo-white.png"
                  alt="Colonial KC Logo"
                  style={{
                    width: "144px",
                    transition: "transform 0.2s ease",
                    transform: hoverLogo ? "scale(1.1)" : "scale(1)",
                  }}
                />
              </a>
            </div>

            {/* Two-line title => fade in */}
            <div
              className="title-group"
              style={{
                transition: "opacity 1s ease-in-out",
                opacity: fadeInTitle ? 1 : 0,
                marginBottom: "3rem",
              }}
            >
              <h1 className="title-heading" style={{ margin: 0 }}>
                Discipleship
              </h1>
              <h1 className="title-heading" style={{ margin: 0 }}>
                Assessment
              </h1>
            </div>

            {/* Buttons => stacked vertically with transparent background */}
            <div
              style={{
                transition: "opacity 1s ease-in-out",
                opacity: fadeInButtons ? 1 : 0,
              }}
            >
              {/* Transparent layer behind the buttons */}
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "2rem 3rem",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                {/* Log In button (top) */}
                <a
                  href="/signin"
                  onMouseEnter={() => setHoverSignIn(true)}
                  onMouseLeave={() => setHoverSignIn(false)}
                  style={{
                    ...buttonStyle,
                    transform: hoverSignIn ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  Log In
                </a>

                {/* Sign Up button (bottom) */}
                <a
                  href="/signup"
                  onMouseEnter={() => setHoverSignUp(true)}
                  onMouseLeave={() => setHoverSignUp(false)}
                  style={{
                    ...buttonStyle,
                    transform: hoverSignUp ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style for heading responsiveness */}
      <style jsx>{`
        .title-heading {
          font-size: 4.5rem; /* large on desktop */
        }

        @media (max-width: 600px) {
          .title-heading {
            font-size: 3rem; /* smaller on mobile */
          }
        }
      `}</style>
    </>
  );
}
