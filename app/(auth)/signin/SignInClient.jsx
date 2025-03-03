"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if there's a "resetSuccess=1" param
  const resetSuccess = searchParams.get("resetSuccess") === "1";
  const [showSuccessMsg, setShowSuccessMsg] = useState(resetSuccess);

  // Fade states
  const [fadeInBg, setFadeInBg] = useState(false);
  const [fadeInTitle, setFadeInTitle] = useState(false);
  const [fadeInButton, setFadeInButton] = useState(false);

  // Credentials form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Hover states
  const [hoverBack, setHoverBack] = useState(false);
  const [hoverEnter, setHoverEnter] = useState(false);

  useEffect(() => {
    // Timed fade-ins
    const tBg = setTimeout(() => setFadeInBg(true), 1500);
    const tTitle = setTimeout(() => setFadeInTitle(true), 2000);
    const tBtn = setTimeout(() => setFadeInButton(true), 3500);

    return () => {
      clearTimeout(tBg);
      clearTimeout(tTitle);
      clearTimeout(tBtn);
    };
  }, []);

  // Hide success message after 5s
  useEffect(() => {
    if (showSuccessMsg) {
      const timer = setTimeout(() => setShowSuccessMsg(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMsg]);

  const routerBack = () => router.back();

  // If session is loading
  if (status === "loading") {
    return <div style={{ color: "#fff", margin: "2rem" }}>Checking session...</div>;
  }

  // If already signed in => go to /assessment
  if (session) {
    router.push("/assessment");
    return null;
  }

  // Handle credentials sign-in
  async function handleCredentialsSignIn(e) {
    e.preventDefault();
    setAuthError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setAuthError(result.error);
    } else {
      router.push("/assessment");
    }
  }

  // Common button style
  const buttonStyle = {
    display: "inline-block",
    padding: "0.8rem 1.5rem",
    fontSize: "1.2rem",
    textDecoration: "none",
    border: "2px solid #fff",
    color: "#fff",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  };

  return (
    <>
      {/* Global styles => no overflow hidden => allow normal scrolling */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: black;
          color: #fff;
          font-family: "Trebuchet MS", sans-serif;
          /* Let content scroll on smaller devices if needed */
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

        {/* Centered content */}
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
          }}
        >
          {/* Container with maxWidth & padding => no text overflow */}
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "0 1rem",
              boxSizing: "border-box",
            }}
          >
            <h1
              style={{
                fontSize: "4.5rem",
                marginBottom: "2rem",
                opacity: fadeInTitle ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
              className="signin-heading"
            >
              Sign In
            </h1>

            <div
              style={{
                opacity: fadeInButton ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
            >
              {/* success message if password was reset */}
              {showSuccessMsg && (
                <p style={{ color: "lightgreen", marginBottom: "1rem" }}>
                  Password was successfully reset.
                </p>
              )}
              {/* error if credentials fail */}
              {authError && (
                <p style={{ color: "red", marginBottom: "1rem" }}>{authError}</p>
              )}

              {/* Semi-transparent container for the sign-in form */}
              <form
                onSubmit={handleCredentialsSignIn}
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "2rem",
                  borderRadius: "8px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      padding: "0.5rem",
                      fontSize: "1rem",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      padding: "0.5rem",
                      fontSize: "1rem",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Buttons row => Back & Enter */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                    marginTop: "1.5rem",
                  }}
                >
                  {/* BACK button */}
                  <button
                    type="button"
                    onClick={routerBack}
                    onMouseEnter={() => setHoverBack(true)}
                    onMouseLeave={() => setHoverBack(false)}
                    style={{
                      ...buttonStyle,
                      transform: hoverBack ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    Back
                  </button>

                  {/* ENTER button */}
                  <button
                    type="submit"
                    onMouseEnter={() => setHoverEnter(true)}
                    onMouseLeave={() => setHoverEnter(false)}
                    style={{
                      ...buttonStyle,
                      transform: hoverEnter ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    Enter
                  </button>
                </div>
              </form>

              {/* Forgot Password link */}
              <div style={{ marginTop: "2rem" }}>
                <a
                  href="/reset-password"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional media query if you want smaller heading on mobile */}
      <style jsx>{`
        @media (max-width: 600px) {
          .signin-heading {
            font-size: 3rem; /* reduce from 4.5rem on narrower screens */
          }
        }
      `}</style>
    </>
  );
}
