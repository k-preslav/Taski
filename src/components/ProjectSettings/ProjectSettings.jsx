import React, { useState } from "react";
import { X, Trash2, Save, Settings2 } from "lucide-react";
import "./ProjectSettings.css";

export default function ProjectSettings({
  project,
  onSave,
  onDelete,
  onClose,
}) {
  const [name, setName] = useState(project?.name || "");
  const [isPublic, setIsPublic] = useState(project?.isPublic || false);

  return (
    <aside className="project-settings">
      <div className="settings-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings2 size={18} color="#fff" />
          <span className="settings-header__title">Settings</span>
        </div>
        <X
          size={20}
          color="#898989"
          style={{ cursor: "pointer" }}
          onClick={onClose}
        />
      </div>

      <div className="settings-content">
        <div className="settings-group">
          <label className="settings-label">Project Name</label>
          <input
            className="settings-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name..."
          />
        </div>

        <div className="settings-group">
          <label className="settings-label">Visibility</label>
          <div className="pill-toggle">
            <div
              className={`pill-toggle__slider ${isPublic ? "pill-toggle__slider--right" : ""}`}
            />
            <button
              type="button"
              className={`pill-toggle__btn ${!isPublic ? "is-active" : ""}`}
              onClick={() => {
                setIsPublic(false);
              }}
            >
              Private
            </button>
            <button
              type="button"
              className={`pill-toggle__btn ${isPublic ? "is-active" : ""}`}
              onClick={() => {
                setIsPublic(true);
              }}
            >
              Public
            </button>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn" onClick={() => onSave(name, isPublic)}>
          <Save size={16} />
          Save Changes
        </button>

        <button className="btn-danger" onClick={onDelete}>
          <Trash2 size={16} />
          Delete Project
        </button>
      </div>
    </aside>
  );
}
