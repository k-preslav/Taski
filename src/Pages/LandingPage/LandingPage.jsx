import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LightRays from "@/components/LightRays/LightRays";
import "./LandingPage.css";
import TextPressure from "@/components/TextPressure";

const SHUFFLE_WORDS = ["developers", "creators", "cool people"];

export default function LandingPage() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % SHUFFLE_WORDS.length);
        setIsExiting(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.3}
          lightSpread={1}
          rayLength={2}
          pulsating={false}
          fadeDistance={0.5}
          saturation={1}
          followMouse
          mouseInfluence={0.17}
          noiseAmount={0.25}
          distortion={0}
        />
      </div>

      <div style={{ marginBottom: '21px' }}>
        <TextPressure
          text="Taski"
          flex
          alpha={false}
          stroke={false}
          weight={true}
          italic
          textColor="#ffffff"
          fontSize={'12rem'}
        />
      </div>

      <div className="sentence-container">
        <TextPressure
          text="The productivity tool for"
          alpha={false}
          stroke={false}
          italic={false}
          weight={true}
          textColor="var(--text-subtle)"
          fontSize={'2rem'}
        />

        <div className="sliding-word-wrapper">
          <div className={`sliding-word ${isExiting ? "exiting" : "entering"}`}>
            <TextPressure
              text={SHUFFLE_WORDS[wordIndex]}
              alpha={false}
              stroke={false}
              italic={false}
              weight={true}
              textColor="var(--text-subtle)"
              fontSize={'2rem'}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div>
          <TextPressure
            text="It's free!"
            alpha={true}
            stroke={false}
            italic={false}
            weight={true}
            textColor="var(--text-subtle)"
            fontSize={'1.5rem'}
          />
        </div>
        <button
          className="get-started-button"
          onClick={() => {
            navigate("/projects");
          }}
        >
          Get Started
        </button>
      </div>

      <div className="footer-text">
        And it's open source! <a href="https://github.com/k-preslav/Taski" target="_blank" rel="noreferrer">View on GitHub</a>
      </div>
    </div>
  );
}