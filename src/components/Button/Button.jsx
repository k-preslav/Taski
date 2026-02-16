import React from "react";
import "./Button.css";

export default function Button({ onClick, children, textAlign, disabled }) {
  return (
    <div
      className={`button ${disabled ? "disabled" : ""}`}
      onClick={disabled ? null : onClick}
      style={{ textAlign: textAlign }}
    >
      {children}
    </div>
  );
}
