import React from "react";
import { Loader2Icon, LoaderCircle, LoaderPinwheelIcon } from "lucide-react";
import "./Spinner.css";

export default function Spinner({
  size = 36,
  color = "currentColor",
  className = "",
}) {
  return (
    <div
      className={`spinner ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <LoaderPinwheelIcon size={size} color={color} />
    </div>
  );
}
