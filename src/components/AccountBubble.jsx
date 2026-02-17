import React from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountBubble({ size = 36, onClick }) {
  const { user } = useAuth();

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "";
  const diameter = typeof size === "number" ? size : 36;
  const fontSize = Math.round(diameter * 0.45);

  const containerStyle = {
    width: diameter,
    height: diameter,
    minWidth: diameter,
    minHeight: diameter,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    cursor: onClick ? "pointer" : "default",
    userSelect: "none",
    background: "linear-gradient(180deg, #FB6603 0%, #2854E5 100%)",
  };

  const textStyle = {
    color: "#fff",
    fontWeight: 500,
    fontStyle: "italic",
    fontFamily: '"Rubik", system-ui, -apple-system, sans-serif',
    fontSize: `${fontSize}px`,
    lineHeight: 1,
    transform: "translateY(0.3px) translateX(-1.6px)",
  };

  return (
    <div style={containerStyle} onClick={onClick} aria-label="Account">
      <span style={textStyle}>{initial}</span>
    </div>
  );
}
