import React, { useState, useRef, useEffect } from "react";
import "./Card.css";
import { tablesDB } from "../../appwrite/config";
import { MenuIcon, Trash2Icon } from "lucide-react";
import Confirmation from "../Confirmation/Confirmation";

function Card({ cardData: elementData, camera, isPanning, onCardClick, zIndex, onDelete, isUserOwner }) {
  const cardRef = useRef(null);

  const [position, setPosition] = useState({
    x: elementData.x || 0,
    y: elementData.y || 0,
  });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(elementData.title || "");

  const [editingContent, setEditingContent] = useState(false);
  const [draftContent, setDraftContent] = useState(elementData.content || "");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setDraftContent(elementData.content || "");
    setDraftTitle(elementData.title || "");
  }, [elementData.content, elementData.title]);

  useEffect(() => {
    if (!dragging) {
      setPosition({
        x: elementData.x || 0,
        y: elementData.y || 0,
      });
    }
  }, [elementData.x, elementData.y]);

  const updateCardData = async (data = {}) => {
    if (!isUserOwner) return;

    try {
      await tablesDB.updateRow({
        databaseId: "taski",
        tableId: "elements",
        rowId: elementData.$id,
        data: {
          title: draftTitle,
          content: draftContent,
          x: position.x,
          y: position.y,
          zIndex: zIndex,
          ...data,
        },
      });
    } catch (error) {
      console.error("Failed to update card:", error);
    }
  };

  const deleteCard = async (cardId) => {
    if (!isUserOwner) return;

    try {
      onDelete(cardId);

      await tablesDB.deleteRow({
        databaseId: "taski",
        tableId: "elements",
        rowId: cardId,
      });
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  const saveTitle = async () => {
    if (!isUserOwner) return;

    setEditingTitle(false);
    if (draftTitle === elementData.title) return;
    await updateCardData({ title: draftTitle });
  };

  const saveContent = async () => {
    if (!isUserOwner) return;

    setEditingContent(false);
    if (draftContent === elementData.content) return;
    await updateCardData({ content: draftContent });
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 || editingContent || editingTitle || !isUserOwner) return;

    onCardClick(elementData.$id);

    setDragging(true);
    offset.current = {
      x: e.clientX - position.x - camera.x,
      y: e.clientY - position.y - camera.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isUserOwner) return;

    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.current.x - camera.x,
      y: e.clientY - offset.current.y - camera.y,
    });
  };

  const handlePointerUp = async (e) => {
    if (!isUserOwner) return;

    if (!dragging) return;
    setDragging(false);
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }

    await updateCardData();
  };

  const renderContent = () => {
    if (draftContent === "") {
      return (
        <div style={{ color: "var(--text-muted)", opacity: 0.6, fontStyle: "italic" }}>
          Double click to type...
        </div>
      );
    }

    const lines = draftContent.split("\n");
    return lines.map((line, idx) => {
      const checkboxMatch = line.match(/^(- )?\[( |x)\] (.*)/);
      if (checkboxMatch) {
        const checked = checkboxMatch[2] === "x";

        const toggleCheckbox = async () => {
          if (!isUserOwner) return;

          const newStatus = checked ? " " : "x";
          const newLines = [...lines];
          newLines[idx] = lines[idx].replace(/\[( |x)\]/, `[${newStatus}]`);
          const newContent = newLines.join("\n");

          setDraftContent(newContent);
          await updateCardData({ content: newContent });
        };

        return (
          <div key={idx} className="checkboxLine" onClick={() => toggleCheckbox()}>
            <input
              type="checkbox"
              checked={checked}
              disabled={!isUserOwner}
              onChange={toggleCheckbox}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            />
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleCheckbox();
              }}
            >
              {checkboxMatch[3]}
            </span>
          </div>
        );
      }
      if (line.startsWith("- ")) return <li className="bulletpoint" key={idx}>{line.slice(2)}</li>;
      if (line.startsWith("# ")) return <span className="heading" key={idx}>{line.slice(2)}</span>;
      if (line.startsWith("---")) return <div className="separator" key={idx}></div>;
      return (
        <div key={idx} className={line === "" ? "emptyLine" : ""}>
          {line || "\u00A0"}
        </div>
      );
    });
  };

  const autoResizeTextarea = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        transform: `translate(${position.x + camera.x}px, ${position.y + camera.y}px)`,
        zIndex: zIndex,
        transition: (dragging || isPanning) ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)"
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="header"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onDoubleClick={(e) => {
          if (!isUserOwner) return;

          e.stopPropagation();
          setEditingTitle(true);
        }}
      >
        {editingTitle ? (
          <input
            autoFocus
            className="titleEditor"
            spellCheck={false}
            autoComplete="off"
            value={draftTitle}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => setDraftTitle(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") {
                setEditingTitle(false);
                setDraftTitle(elementData.title);
              }
            }}
          />
        ) : (
          <span className="headerText">{draftTitle || "Untitled Card"}</span>
        )}

        {isUserOwner && (
          <div
            className="headerIcon"
            onPointerDown={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
          >
            <Trash2Icon size={16} color="var(--danger)" style={{ transform: 'translateY(3px)' }} />
          </div>
        )}
      </div>

      <div
        className="content"
        onDoubleClick={(e) => {
          if (!isUserOwner) return;
          e.stopPropagation();

          setEditingContent(true);

          setTimeout(() => {
            const textarea = cardRef.current?.querySelector('.contentEditor');
            if (textarea) {
              textarea.style.height = "auto";
              textarea.style.height = `${textarea.scrollHeight + 20}px`;
            }
          }, 0);
        }}
      >
        {editingContent ? (
          <textarea
            autoFocus
            className="contentEditor"
            spellCheck={false}
            autoComplete="off"
            value={draftContent}
            onFocus={autoResizeTextarea}
            onChange={(e) => {
              setDraftContent(e.target.value);
              autoResizeTextarea(e);
            }}
            onBlur={saveContent}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setEditingContent(false);
                setDraftContent(elementData.content);
              }
              if (e.key === "Enter" && !e.shiftKey) saveContent();
            }}
          />
        ) : (
          renderContent()
        )}
      </div>

      {showDeleteConfirm &&
        <Confirmation
          title="Are you sure you want to delete this card?"
          confirmText="Delete Card"
          isDestructive={true}
          onConfirm={() => {
            if (!isUserOwner) return;

            setShowDeleteConfirm(false);
            deleteCard(elementData.$id);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      }
    </div>
  );
}

export default Card;