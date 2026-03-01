import React, { useState, useRef, useEffect } from "react";
import { tablesDB } from "../../appwrite/config";
import { Trash2Icon } from "lucide-react";
import Confirmation from "../Confirmation/Confirmation";
import "./TextElement.css";

// --- UPDATED: Added `scale = 1` ---
function TextElement({ textData, camera, scale = 1, isPanning, onCardClick, zIndex, onDelete, isUserOwner }) {
  const [position, setPosition] = useState({
    x: textData.x || 0,
    y: textData.y || 0,
  });

  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(textData.content || "");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setContent(textData.content || "");
  }, [textData.content]);

  useEffect(() => {
    if (!dragging) {
      setPosition({
        x: textData.x || 0,
        y: textData.y || 0,
      });
    }
  }, [textData.x, textData.y]);

  const updateTextData = async (data = {}) => {
    if (!isUserOwner) return;

    try {
      await tablesDB.updateRow({
        databaseId: "taski",
        tableId: "elements",
        rowId: textData.$id,
        data: {
          content: content,
          x: position.x,
          y: position.y,
          zIndex: zIndex,
          ...data,
        },
      });
    } catch (error) {
      console.error("Failed to update text element:", error);
    }
  };

  const deleteElement = async () => {
    if (!isUserOwner) return;
    try {
      onDelete(textData.$id);
      await tablesDB.deleteRow({
        databaseId: "taski",
        tableId: "elements",
        rowId: textData.$id,
      });
    } catch (error) {
      console.error("Failed to delete text element:", error);
    }
  };

  const saveContent = async () => {
    if (!isUserOwner) return;

    setEditing(false);

    if (content.trim() === "") {
      await deleteElement();
      return;
    }

    if (content === textData.content) return;
    await updateTextData({ content });
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 || editing || !isUserOwner) return;

    e.stopPropagation();
    onCardClick(textData.$id);

    setDragging(true);

    // --- UPDATED: Calculate offset based on world coordinates ---
    const mouseWorldX = (e.clientX - camera.x) / scale;
    const mouseWorldY = (e.clientY - camera.y) / scale;

    offset.current = {
      x: mouseWorldX - position.x,
      y: mouseWorldY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging || !isUserOwner) return;

    // --- UPDATED: Calculate position based on world coordinates ---
    const mouseWorldX = (e.clientX - camera.x) / scale;
    const mouseWorldY = (e.clientY - camera.y) / scale;

    setPosition({
      x: mouseWorldX - offset.current.x,
      y: mouseWorldY - offset.current.y,
    });
  };

  const handlePointerUp = async (e) => {
    if (!dragging || !isUserOwner) return;
    setDragging(false);
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
    await updateTextData();
  };

  return (
    <div
      className={`text-element-wrapper ${editing ? "is-editing" : ""}`}
      style={{
        // --- UPDATED: Apply scale to translation and CSS transform ---
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transformOrigin: "top left",
        zIndex: zIndex,
        cursor: dragging ? "grabbing" : editing ? "text" : "grab",
        transition: dragging ? "none" : "transform 0.15s cubic-bezier(0.2, 0, 0, 1)"
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={(e) => {
        if (!isUserOwner) return;

        e.stopPropagation();
        setEditing(true);
      }}
    >
      {!editing && isUserOwner && (
        <button
          className="text-delete-btn"
          onPointerDown={(e) => {
            if (!isUserOwner) return;

            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
        >
          <Trash2Icon size={14} />
        </button>
      )}

      {editing ? (
        <div
          className="input-sizer"
          data-value={content || "Double click to type..."}
        >
          <input
            size={1}
            id={`input-${textData.$id}`}
            name="canvas-text-input"
            autoComplete="off"
            spellCheck="false"
            autoFocus
            className="text-element-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={saveContent}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveContent();
              if (e.key === "Escape") {
                setEditing(false);
                setContent(textData.content);
              }
            }}
            placeholder="Double click to type..."
          />
        </div>
      ) : (
        <div className="text-element-display">
          {content || <span className="text-placeholder">Double click to type...</span>}
        </div>
      )}

      {showDeleteConfirm && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{ position: 'absolute', zIndex: 9999 }}
        >
          <Confirmation
            title="Are you sure you want to delete this text?"
            confirmText="Delete Text"
            isDestructive={true}
            onConfirm={() => {
              if (!isUserOwner) return;

              setShowDeleteConfirm(false);
              deleteElement();
            }}
            onCancel={() => {
              setShowDeleteConfirm(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default TextElement;