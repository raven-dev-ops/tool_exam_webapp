"use client";

import React, { useEffect, useState, useRef } from "react";
import { Radar } from "react-chartjs-2";

// Register Chart.js modules
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function SummaryPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // For highlighting + bigger label in chart
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [displayedCategory, setDisplayedCategory] = useState(null);
  const [fadeState, setFadeState] = useState("in"); // "in" or "out"
  const [hoveredCat, setHoveredCat] = useState(null);

  // reference to summary background video
  const videoRef = useRef(null);

  // 1) Load the newest assessment data
  useEffect(() => {
    async function loadSummary() {
      try {
        const assessRes = await fetch("/api/assessment");
        if (!assessRes.ok) {
          console.error("Failed to fetch newest assessment");
          setLoading(false);
          return;
        }
        const assessData = await assessRes.json();

        if (!Array.isArray(assessData) || assessData.length === 0) {
          console.warn("No assessments found for this user");
          setLoading(false);
          return;
        }

        const newest = assessData[0];
        if (!newest.scores) {
          console.warn("No scores on newest doc");
          setLoading(false);
          return;
        }

        // Convert newest.scores => array form: [ [ESTABLISH, 12], ... ]
        const rawScores = Object.entries(newest.scores);

        // 2) Fetch question categories => get descriptions
        const questionsRes = await fetch("/api/questions");
        if (!questionsRes.ok) {
          console.error("Failed to fetch categories");
          setLoading(false);
          return;
        }
        const questionsData = await questionsRes.json();
        const { categories = [] } = questionsData;

        // 3) Merge each score with the correct description from categories
        let combined = rawScores
          .map(([catKey, val]) => {
            const match = categories.find((c) => c.category === catKey);
            if (!match) {
              return null;
            }
            return {
              category: match.category,
              score: Number(val),
              description: match.description,
            };
          })
          .filter(Boolean);

        // 4) Sort highest -> lowest
        combined.sort((a, b) => b.score - a.score);
        setScores(combined);

        // 5) Select & display the last (lowest) category
        if (combined.length > 0) {
          setSelectedCategory(combined[combined.length - 1].category);
          setDisplayedCategory(combined[combined.length - 1].category);
        }
      } catch (err) {
        console.error("Error loading summary:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  // If loading
  if (loading) {
    return (
      <div style={loadingStyle}>
        <p>Loading summary...</p>
      </div>
    );
  }

  // If no scores
  if (!scores.length) {
    return (
      <div style={loadingStyle}>
        <p>No scores found</p>
      </div>
    );
  }

  // Prepare chart data
  const labels = scores.map((item) => item.category);
  const dataPoints = scores.map((item) => item.score);

  // Dynamic scale range
  const maxScore = Math.max(...dataPoints);
  const minScore = Math.min(...dataPoints);
  const chartMin = Math.max(0, minScore - 2);
  const chartMax = maxScore + 2;

  const radarData = {
    labels,
    datasets: [
      {
        label: "",
        data: dataPoints,
        backgroundColor: "rgba(54,162,235,0.2)",
        borderColor: "rgba(54,162,235,1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(54,162,235,1)",
      },
    ],
  };

  const selectedIndex = labels.indexOf(selectedCategory);

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        angleLines: { display: true },
        grid: { color: "rgba(255,255,255,0.4)" },
        suggestedMin: chartMin,
        suggestedMax: chartMax,
        ticks: {
          display: false,
          color: "#fff",
        },
        pointLabels: {
          font: (ctx) => {
            const idx = ctx.index;
            if (idx === selectedIndex && idx !== -1) {
              return { size: 28, weight: "bold" };
            }
            return { size: 24 };
          },
          color: "#fff",
        },
      },
    },
  };

  // fade out/in for the displayed category description
  const displayedItemData = scores.find((s) => s.category === displayedCategory);

  // style for description
  const descStyle = {
    fontSize: "1.4rem",
    transition: "opacity 0.4s ease",
    whiteSpace: "pre-wrap",
    textAlign: "center",
    opacity: fadeState === "out" ? 0 : 1,
    marginTop: "1.5rem",
    color: "#fff",
  };

  // Handle category click
  function handleCategoryClick(cat) {
    if (cat === selectedCategory) return;
    setSelectedCategory(cat);
    setFadeState("out");
    setTimeout(() => {
      setDisplayedCategory(cat);
      setFadeState("in");
    }, 400);
  }

  return (
    <>
      {/* Global styles => scrolling on mobile */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: black;
          color: white;
          font-family: "Trebuchet MS", sans-serif;
          overflow-y: auto;
        }
      `}</style>

      {/* Dark BG behind everything */}
      <div style={bgBlackStyle} />

      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={videoStyle}
        src="/videos/summary.mp4"
      />

      {/* Outer flex container => center if short */}
      <div style={outerStyle}>
        <div style={panelStyle}>
          {/* Score row => 3 columns on mobile */}
          <div className="score-row" style={scoreRowStyle}>
            {scores.map((item) => {
              const isHovered = item.category === hoveredCat;
              const scaleVal = isHovered ? "scale(1.05)" : "scale(1)";
              const isSelected = item.category === selectedCategory;

              return (
                <div
                  key={item.category}
                  onClick={() => handleCategoryClick(item.category)}
                  onMouseEnter={() => setHoveredCat(item.category)}
                  onMouseLeave={() => setHoveredCat(null)}
                  className="category-box"
                  style={{
                    ...boxStyle,
                    transform: scaleVal,
                    backgroundColor: isSelected ? "#e0ffe0" : "#f9f9f9",
                  }}
                >
                  <strong className="box-title">{item.category}</strong>
                  <div className="box-score" style={{ marginTop: "4px" }}>
                    {item.score}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radar Chart => smaller on mobile */}
          <div className="chart-wrapper" style={chartWrapperStyle}>
            <Radar data={radarData} options={radarOptions} />
          </div>

          {/* Category description below the chart */}
          <div style={descStyle}>
            {displayedItemData && <p>{displayedItemData.description}</p>}
          </div>
        </div>
      </div>

      {/* Media queries */}
      <style jsx>{`
        @media (max-width: 600px) {
          /* 1) Layout 3 columns on phone */
          .score-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
          }
          /* Let grid handle box widths, smaller fonts */
          .category-box {
            min-width: 0;
          }
          .category-box .box-title {
            font-size: 14px; /* smaller for 3 columns */
          }
          .category-box .box-score {
            font-size: 16px;
          }

          /* 2) Chart => smaller */
          .chart-wrapper {
            max-width: 280px;  /* smaller width */
            width: 100%;
            height: 200px;     /* smaller height */
          }
        }
      `}</style>
    </>
  );
}

/* ====================== STYLES ====================== */

const loadingStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  color: "white",
};

const bgBlackStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "black",
  zIndex: -1,
};

const videoStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  objectFit: "cover",
  zIndex: 1,
};

const outerStyle = {
  position: "relative",
  zIndex: 2,
  width: "100vw",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "1rem",
  boxSizing: "border-box",
};

const panelStyle = {
  width: "100%",
  maxWidth: "900px",
  backgroundColor: "rgba(0,0,0,0.4)",
  borderRadius: "8px",
  padding: "2rem",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

const scoreRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  justifyContent: "center",
  marginBottom: "2rem",
};

const boxStyle = {
  cursor: "pointer",
  padding: "1rem",
  border: "2px solid #ccc",
  borderRadius: "8px",
  minWidth: "90px",
  color: "#000",
  transition: "transform 0.2s ease",
  textAlign: "center",
};

const chartWrapperStyle = {
  width: "100%",
  maxWidth: "700px",
  height: "400px",
  margin: "0 auto",
  marginBottom: "2rem",
  position: "relative",
};
