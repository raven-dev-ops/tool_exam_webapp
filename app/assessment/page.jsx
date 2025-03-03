"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [flashMissing, setFlashMissing] = useState(false);
  const [visibleIndexes, setVisibleIndexes] = useState([]);

  const QUESTIONS_PER_STEP = 6;

  // 1) Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  }

  // 2) Animate each question on step change
  useEffect(() => {
    const startIdx = currentStep * QUESTIONS_PER_STEP;
    const endIdx = startIdx + QUESTIONS_PER_STEP;
    setVisibleIndexes([]);

    const sliceCount = questions.slice(startIdx, endIdx).length;
    const timers = [];
    for (let i = 0; i < sliceCount; i++) {
      const questionIndex = startIdx + i;
      const delayMs = 200 * i; // 200ms stagger
      const timer = setTimeout(() => {
        setVisibleIndexes((prev) => [...prev, questionIndex]);
      }, delayMs);
      timers.push(timer);
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, [currentStep, questions]);

  // 3) Basic logic
  const totalSteps = Math.ceil(questions.length / QUESTIONS_PER_STEP);
  const startIndex = currentStep * QUESTIONS_PER_STEP;
  const endIndex = startIndex + QUESTIONS_PER_STEP;
  const stepQuestions = questions.slice(startIndex, endIndex);

  function handleAnswerChange(qId, val) {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  function getUnansweredQids() {
    return stepQuestions
      .filter((q) => !answers[q.id] || answers[q.id] === "")
      .map((q) => q.id);
  }

  function handleNext() {
    const missing = getUnansweredQids();
    if (missing.length > 0) {
      setFlashMissing(true);
      setTimeout(() => setFlashMissing(false), 500);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  }

  function handlePrevious() {
    setFlashMissing(false);
    setCurrentStep((prev) => prev - 1);
  }

  async function handleSubmit() {
    const missing = getUnansweredQids();
    if (missing.length > 0) {
      setFlashMissing(true);
      setTimeout(() => setFlashMissing(false), 500);
      return;
    }

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        router.push("/assessment/summary");
      } else {
        console.error("Error saving assessment");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  }

  if (questions.length === 0) {
    return (
      <p style={{ color: "#fff", margin: 0, padding: "1rem" }}>
        Loading questions...
      </p>
    );
  }

  return (
    <>
      {/* Global styles => black bg, white text, allow scroll */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: black;
          color: #fff;
          font-family: "Trebuchet MS", sans-serif;
          /* Let content scroll if it's taller than the viewport */
          overflow-y: auto;
        }
      `}</style>

      {/* Fixed background video */}
      <div style={{ position: "fixed", width: "100%", height: "100%" }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          src="/videos/assessment.mp4"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Outer wrapper => center wizard horizontally/vertically if short */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "1rem",
          boxSizing: "border-box",
        }}
      >
        <div className="wizard-container">
          {/* Step dots */}
          <div className="step-dots">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span key={i} className={`dot ${i === currentStep ? "active" : ""}`} />
            ))}
          </div>

          {/* Legend */}
          <div className="legend-row">
            <span>1 (seldom me)</span>
            <span>5 (almost always me)</span>
          </div>

          {/* Questions */}
          {stepQuestions.map((q, idx) => {
            const questionIndex = startIndex + idx;
            const isVisible = visibleIndexes.includes(questionIndex);
            const isUnanswered =
              flashMissing && (!answers[q.id] || answers[q.id] === "");

            return (
              <div
                key={q.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 0.8s ease-in-out",
                  marginBottom: "1.5rem",
                }}
              >
                <p style={{ color: isUnanswered ? "red" : "#fff", margin: 0 }}>
                  {q.text}
                </p>
                <div style={{ margin: "0.4rem 0 0" }}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <label
                      key={val}
                      style={{ marginRight: "1rem" }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={val}
                        checked={answers[q.id] === String(val)}
                        onChange={() => handleAnswerChange(q.id, String(val))}
                        style={{
                          transform: "scale(1.2)",
                          marginRight: "0.3rem",
                        }}
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Nav buttons */}
          <div className="nav-buttons">
            {currentStep > 0 && <button onClick={handlePrevious}>Previous</button>}
            {currentStep < totalSteps - 1 ? (
              <button onClick={handleNext}>Next</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .wizard-container {
          width: 100%;
          max-width: 800px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem 1.5rem;
          box-sizing: border-box;
        }

        .step-dots {
          margin: 0.5rem 0 1rem;
          text-align: center;
        }
        .dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 0 4px;
          background-color: #666;
        }
        .dot.active {
          background-color: #fff;
        }

        .legend-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: #fff;
          font-size: 0.9rem; /* smaller text to fit better */
        }

        .nav-buttons {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        .nav-buttons button {
          padding: 0.4rem 1rem; /* smaller button size */
          font-size: 20px;
          border: 1px solid #fff;
          background-color: transparent;
          color: #fff;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .wizard-container {
            font-size: 14px; /* smaller overall */
            padding: 0.5rem 1rem;
          }
          .nav-buttons button {
            font-size: 16px;
          }
          .legend-row {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}
