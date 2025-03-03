"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const router = useRouter();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState(null);

  // For highlighting empty fields
  const [fieldError, setFieldError] = useState({
    firstName: false,
    lastName: false,
    gender: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Fade states
  const [fadeInBg, setFadeInBg] = useState(false);
  const [fadeInTitle, setFadeInTitle] = useState(false);
  const [fadeInForm, setFadeInForm] = useState(false);

  useEffect(() => {
    const tBg = setTimeout(() => setFadeInBg(true), 500);
    const tTitle = setTimeout(() => setFadeInTitle(true), 1000);
    const tForm = setTimeout(() => setFadeInForm(true), 1500);

    return () => {
      clearTimeout(tBg);
      clearTimeout(tTitle);
      clearTimeout(tForm);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    // Collect missing fields
    const missing = [];
    if (!firstName) missing.push("firstName");
    if (!lastName) missing.push("lastName");
    if (!gender) missing.push("gender");
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (!confirmPassword) missing.push("confirmPassword");

    // Check for missing fields
    if (missing.length) {
      setMsg("Please fill all fields");
      // Flash red border on missing fields
      let newErrorState = { ...fieldError };
      missing.forEach((f) => (newErrorState[f] = true));
      setFieldError(newErrorState);

      // Revert to normal border after 1 second
      setTimeout(() => {
        let revert = { ...fieldError };
        missing.forEach((f) => (revert[f] = false));
        setFieldError(revert);
      }, 1000);

      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setMsg("Passwords do not match");
      // briefly flash both password & confirm in red
      setFieldError((prev) => ({ ...prev, password: true, confirmPassword: true }));
      setTimeout(() => {
        setFieldError((prev) => ({
          ...prev,
          password: false,
          confirmPassword: false,
        }));
      }, 1000);
      return;
    }

    try {
      // 1) Register user => /api/register
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, gender, email, password }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json();
        setMsg(data.error || "Registration failed");
        return;
      }

      // 2) Immediately sign the user in using NextAuth (Credentials Provider)
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setMsg(signInResult.error || "Login failed");
        return;
      }

      // 3) If signIn is successful => /assessment
      setMsg("Registration & Login successful! Redirecting to assessment...");
      setTimeout(() => {
        router.push("/assessment");
      }, 1500);
    } catch (err) {
      console.error("Sign up error:", err);
      setMsg("Error occurred. Try again.");
    }
  }

  return (
    <>
      {/* Global styling => allow scrolling on smaller screens */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: black;
          color: #fff;
          font-family: "Trebuchet MS", sans-serif;
          /* Let user scroll if form is taller than screen */
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
        {/* Background video */}
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

        {/* Fading overlay */}
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

        {/* Centered sign up form */}
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
          {/* Container => maxWidth, padding => prevents text overflow */}
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
              className="signup-heading"
            >
              Sign Up
            </h1>

            {/* Translucent container for the form */}
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: "2rem",
                borderRadius: "8px",
                opacity: fadeInForm ? 1 : 0,
                transition: "opacity 1s ease-in-out",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {msg && (
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      marginBottom: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {msg}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="First Name"
                  style={{
                    ...inputStyle,
                    border: fieldError.firstName ? "2px solid red" : inputStyle.border,
                  }}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  style={{
                    ...inputStyle,
                    border: fieldError.lastName ? "2px solid red" : inputStyle.border,
                  }}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />

                <select
                  style={{
                    ...inputStyle,
                    padding: "0.4rem",
                    border: fieldError.gender ? "2px solid red" : inputStyle.border,
                  }}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input
                  type="email"
                  placeholder="Email"
                  style={{
                    ...inputStyle,
                    border: fieldError.email ? "2px solid red" : inputStyle.border,
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Password"
                  style={{
                    ...inputStyle,
                    border: fieldError.password ? "2px solid red" : inputStyle.border,
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Confirm Password */}
                <input
                  type="password"
                  placeholder="Confirm Password"
                  style={{
                    ...inputStyle,
                    border: fieldError.confirmPassword
                      ? "2px solid red"
                      : inputStyle.border,
                  }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {/* Button row */}
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => router.push("/")}
                  >
                    Back
                  </button>
                  <button type="submit" style={buttonStyle}>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Media query => shrink heading on smaller screens */}
      <style jsx>{`
        @media (max-width: 600px) {
          .signup-heading {
            font-size: 3rem;
          }
        }
      `}</style>
    </>
  );
}

const inputStyle = {
  padding: "0.6rem",
  border: "2px solid #fff",
  backgroundColor: "transparent",
  color: "#fff",
  fontSize: "1rem",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "0.6rem 1.2rem",
  border: "2px solid #fff",
  backgroundColor: "transparent",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "transform 0.2s ease",
};
