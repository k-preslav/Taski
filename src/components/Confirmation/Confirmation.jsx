import React from "react";
import ReactDOM from "react-dom";
import { AlertTriangle } from "lucide-react";
import "./Confirmation.css";

export default function Confirmation({
  onConfirm,
  onCancel,
  isDestructive,
  confirmText,
  title,
}) {
  return ReactDOM.createPortal(
    <>
      <div className="confirm-overlay-backdrop" onClick={onCancel} />
      <div className="confirm-box">
        <div className="confirm-header">
          <AlertTriangle
            size={48}
            color={isDestructive ? "#ff4d4d" : "#eab308"}
          />
          <p className="confirm-text">{title || "Are you sure?"}</p>
        </div>
        <div className="confirm-actions">
          <button
            className={
              isDestructive ? "btn-confirm-destructive" : "btn-confirm"
            }
            onClick={onConfirm}
          >
            {confirmText || "Confirm"}
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
