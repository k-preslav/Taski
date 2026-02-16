import React, { useState, useEffect } from "react";
import "./Card.css";
import { tablesDB } from "../../appwrite/config";
import { Trash2Icon, TrashIcon } from "lucide-react";

export default function Card({ text, id, edit, style, onDestroy, onRestore }) {
  const [isEditing, setIsEditing] = useState(edit);
  const [value, setValue] = useState(text);

  useEffect(() => {
    setIsEditing(edit);
  }, [edit]);

  const onSave = async (newValue) => {
    if (newValue.trim() === "") {
      await handleDelete();
      return;
    }

    try {
      await tablesDB.updateRow({
        databaseId: "taski",
        tableId: "cards",
        rowId: id,
        data: {
          content: newValue,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      onDestroy?.();
    } catch (err) {
      console.error("onDestroy handler threw:", err);
    }

    try {
      await tablesDB.deleteRow({
        databaseId: "taski",
        tableId: "cards",
        rowId: id,
      });
    } catch (error) {
      console.error("Failed to delete card on server:", error);
      try {
        if (onRestore) {
          onRestore({
            $id: id,
            content: value,
            isBacklog: undefined,
          });
        } else {
          console.warn(
            "Delete failed and no onRestore provided to recover the card.",
          );
        }
      } catch (restoreErr) {
        console.error("onRestore failed:", restoreErr);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onSave(value);
    }
    if (e.key === "Escape") {
      if (text.trim() === "") {
        handleDelete();
      }
    }
  };

  return (
    <div className="card-wrapper" style={style}>
      <div className="card" onDoubleClick={() => setIsEditing(true)}>
        {isEditing ? (
          <input
            autoFocus
            className="card__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setIsEditing(false);
              onSave(value);
            }}
          />
        ) : (
          <>
            <p className="card__text">{value}</p>
            <div
              className="card__deleteButn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <TrashIcon size={14} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
