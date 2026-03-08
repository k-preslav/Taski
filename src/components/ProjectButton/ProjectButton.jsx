import React, { useState } from "react";
import "./ProjectButton.css";
import AccountBubble from "../AccountBubble";
import { CrownIcon, UsersIcon } from "lucide-react";

export default function ProjectButton({ name, isOwner, onClick, onSave, onCancel }) {
  const [isEditing, setIsEditing] = useState(!name);
  const [value, setValue] = useState(name || "");

  const saveAndExit = (finalValue) => {
    const cleanedValue = finalValue.trim();
    
    // Cancel if empty (no default name)
    if (!cleanedValue) {
      onCancel?.();
      return;
    }
    
    setValue(cleanedValue);
    setIsEditing(false);

    if (cleanedValue !== name) {
      onSave(cleanedValue);
    }
  };

  const handleBlur = () => {
    saveAndExit(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveAndExit(value);
    } else if (e.key === "Escape") {
      // Cancel if it's a new project (no name) on escape
      if (!name) {
        onCancel?.();
      } else {
        setValue(name);
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="project-button" onClick={() => !isEditing && onClick?.()}>
      {isEditing ? (
        <input
          autoFocus
          className="project-button__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="project-button__content">
          <span className="project-button__name">{value || "New Project"}</span>
          {isOwner ? (
            <div className="pill" style={{border: '1px solid var(--accent2)'}}>
              <CrownIcon size={13} strokeWidth={2.7} color="var(--accent2)" />
              <p style={{color: 'var(--accent2)'}}>Owner</p>
            </div>
          ) : (
            <div className="pill" style={{border: '1px solid var(--accent)'}}>
              <UsersIcon size={14} strokeWidth={2.7} color="var(--accent)" />
              <p style={{color: 'var(--accent)'}}>Contributor</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
