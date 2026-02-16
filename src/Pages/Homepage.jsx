import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => {
          navigate("/projects");
        }}
      >
        Get Started
      </button>
    </div>
  );
}
