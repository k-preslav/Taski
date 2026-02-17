import React from "react";
import "./Button.css";

export default function Button({
  onClick,
  children,
  textAlign,
  disabled,
  style = {},
}) {
  return (
    <div
      className={`button ${disabled ? "disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      style={{
        textAlign: textAlign,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
