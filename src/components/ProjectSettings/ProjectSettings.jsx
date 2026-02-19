import React, { useState } from "react";
import { X, Trash2, Save, Settings2 } from "lucide-react";
import Confirmation from "../Confirmation/Confirmation";
import "./ProjectSettings.css";

export default function ProjectSettings({
  project,
  onSave,
  onDelete,
  onClose,
}) {
  const [name, setName] = useState(project?.name || "");
  const [isPublic, setIsPublic] = useState(project?.isPublic || false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = () => {
    onSave(name, isPublic);
    handleClose();
  };

  return (
    <>
      <aside className={`project-settings ${isClosing ? "closing" : ""}`}>
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Settings2 size={18} color="var(--text)" />
            <span className="settings-header__title">Settings</span>
          </div>
          <X
            size={20}
            color="var(--text-muted)"
            style={{ cursor: "pointer" }}
            onClick={handleClose}
          />
        </div>

        <div className="settings-content">
          <div className="settings-group">
            <label className="settings-label">PROJECT NAME</label>
            <input
              className="settings-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">VISIBILITY</label>
            <div className="pill-toggle">
              <div
                className={`pill-toggle__slider ${isPublic ? "pill-toggle__slider--right" : ""}`}
              />
              <button
                type="button"
                className={`pill-toggle__btn ${!isPublic ? "is-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPublic(false);
                }}
              >
                Private
              </button>
              <button
                type="button"
                className={`pill-toggle__btn ${isPublic ? "is-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPublic(true);
                }}
              >
                Public
              </button>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn" onClick={handleSave}>
            <Save size={16} />
            Save Changes
          </button>

          <button className="btn-danger" onClick={() => setShowConfirm(true)}>
            <Trash2 size={16} />
            Delete Project
          </button>
        </div>
      </aside>

      {showConfirm && (
        <Confirmation
          title="Are you sure you want to delete this project?"
          confirmText="Delete Project"
          isDestructive={true}
          onConfirm={onDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}