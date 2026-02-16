import React, { useState } from "react";
import "./ProjectButton.css";
import AccountBubble from "../AccountBubble";

export default function ProjectButton({ name, onClick, onSave }) {
  const [isEditing, setIsEditing] = useState(!name);
  const [value, setValue] = useState(name || "");

  const saveAndExit = (finalValue) => {
    const cleanedValue = finalValue.trim() || "New Project";
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
      setValue(name || "New Project");
      setIsEditing(false);
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
          <AccountBubble size={28} />
        </div>
      )}
    </div>
  );
}
