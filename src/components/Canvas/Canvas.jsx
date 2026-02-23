import React, { useState, useRef, useEffect } from "react";
import Card from "../Element_Card/Card";
import TextElement from "../Element_Text/TextElement";
import { Query, tablesDB } from "../../appwrite/config";
import { ID } from "appwrite";
import CanvasTools from "./CanvasTools";
import { useAuth } from "../../context/AuthContext";

export default function Canvas({ projectData }) {
  const canvasRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const panOffset = useRef({ x: 0, y: 0 });
  const [elements, setElements] = useState([]);

  const {user} = useAuth();

  const isUserOwner = projectData?.ownerId === user.$id;

  const handleElementZIndex = (elementId) => {
    setElements((prevElements) => {
      const maxZIndex = Math.max(...prevElements.map((el) => el.zIndex || 0), 0);
      const targetElement = prevElements.find((el) => el.$id === elementId);

      if (targetElement && (targetElement.zIndex || 0) === maxZIndex) return prevElements;

      return prevElements.map((el) => 
        el.$id === elementId ? { ...el, zIndex: maxZIndex + 1 } : el
      );
    });
  };

  const loadElements = async () => {
    if (!projectData) return;
    const res = await tablesDB.listRows({
      databaseId: "taski",
      tableId: "elements",
      queries: [Query.equal("projectId", projectData.$id)],
    });
    setElements(res.rows);
  };

  useEffect(() => {
    loadElements();
  }, [projectData]);

  const handlePointerDown = (e) => {
    if (e.button !== 2) return;
    setPanning(true);
    panOffset.current = { x: e.clientX - camera.x, y: e.clientY - camera.y };
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!panning) return;
    setCamera({
      x: e.clientX - panOffset.current.x,
      y: e.clientY - panOffset.current.y,
    });
  };

  const handlePointerUp = (e) => {
    setPanning(false);
    canvasRef.current.releasePointerCapture(e.pointerId);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const toolType = e.dataTransfer.getData("toolType");
    if (!toolType) return;

    const newX = e.clientX - camera.x - 8;
    const newY = e.clientY - camera.y - 70;
    const maxZIndex = Math.max(...elements.map((el) => el.zIndex || 0), 0);

    const newElementData = {
      projectId: projectData.$id,
      title: toolType === 'card' ? "New Card" : "",
      content: "",
      x: newX,
      y: newY,
      zIndex: maxZIndex + 1,
      type: toolType,
    };

    try {
      const res = await tablesDB.createRow({
        databaseId: "taski",
        tableId: "elements",
        rowId: ID?.unique(), 
        data: newElementData,
      });
      setElements((prev) => [...prev, res]);
    } catch (error) {
      console.error("Failed to create element:", error);
    }
  };

  const removeElement = (elementId) => {
    setElements((prev) => prev.filter((el) => el.$id !== elementId));
  };

  return (
    <div
      style={styles.wrapper}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        ref={canvasRef}
        style={{
          ...styles.canvas,
          backgroundPosition: `${camera.x % 40}px ${camera.y % 40}px`,
          cursor: panning ? "grabbing" : "default",
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {elements.map((el, index) => {
          const commonProps = {
            camera,
            zIndex: el.zIndex || index + 1,
            onDelete: removeElement,
            onCardClick: handleElementZIndex
          };

          switch (el.type) {
            case "card":
              return <Card isUserOwner={isUserOwner} key={el.$id} {...commonProps} cardData={el} />;
            case "text":
              return <TextElement isUserOwner={isUserOwner} key={el.$id} {...commonProps} textData={el} />;
            case "image":
              // Replace with <ImageElement /> once created
              return <Card isUserOwner={isUserOwner} key={el.$id} {...commonProps} cardData={el} isImage />;
            default:
              return null;
          }
        })}
      </div>

      {isUserOwner && <CanvasTools />}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "var(--bg)",
    touchAction: "none"
  },
  canvas: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `linear-gradient(to right, var(--grid) 1px, transparent 1px), linear-gradient(to bottom, var(--grid) 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
  },
};