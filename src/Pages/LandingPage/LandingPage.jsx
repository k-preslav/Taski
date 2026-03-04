import React, { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import { MonitorCheckIcon, ArrowRight } from "lucide-react";
import LightRays from "@/components/LightRays/LightRays";
import { SiGithub } from "@icons-pack/react-simple-icons";
import "./LandingPage.css";

const ROTATING_WORDS = ["developers", "creators", "cool people"];

export default function LandingPage() {
  const navigate = useNavigate();
  const gradientId = useId();
  const [wordIndex, setWordIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setIsExiting(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      <div className="light-rays-container">
        <LightRays
          raysOrigin="top-center"
          raysColor="#6366f1"
          raysSpeed={0.3}
          lightSpread={2}
          rayLength={2}
          pulsating={false}
          fadeDistance={0.8}
          saturation={1}
          followMouse
          mouseInfluence={0.17}
          noiseAmount={0.25}
          distortion={0}
        />
      </div>

      <div className="landing-container">
        <div className="hero-section">
          <div className="hero-title-container">
            <MonitorCheckIcon
              size={126}
              strokeWidth={2.5}
              stroke={`url(#${gradientId})`}
              className="icon"
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="24"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#a0a0a0" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </MonitorCheckIcon>
            <h1 className="hero-title">Taski</h1>
          </div>

          <div className="hero-subtitle">
            <span>A visual planning space for </span>
            <div className="rotating-word-container">
              <span className={`rotating-word ${isExiting ? "exiting" : "entering"}`}>
                {ROTATING_WORDS[wordIndex]}
              </span>
            </div>
          </div>

          <p className="hero-description">
            Free and open-source, collaboration ready
          </p>

          <div className="cta-group">
            <button className="get-started-button" onClick={() => navigate("/projects")}>
              Get Started
              <ArrowRight size={20} />
            </button>
            <a
              href="https://taski.dev/project/69a096b3003b07e6a9c3"
              target="_blank"
              rel="noreferrer"
              className="demo-button"
            >
              View Demo
            </a>
          </div>
        </div>

        <footer className="landing-footer">
          <a
            href="https://github.com/k-preslav/Taski"
            target="_blank"
            rel="noreferrer"
            className="github-link"
          >
            <SiGithub size={18} />
            View on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}