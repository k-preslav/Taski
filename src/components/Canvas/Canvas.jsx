import React, { useState, useRef, useEffect } from "react";
import Card from "../Element_Card/Card";
import TextElement from "../Element_Text/TextElement";
import client, { Query, realtime, tablesDB } from "../../appwrite/config";
import { Channel, ID, Realtime } from "appwrite";
import CanvasTools from "./CanvasTools";
import { useAuth } from "../../context/AuthContext";

export default function Canvas({ projectData, isOwner }) {
  const canvasRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const panOffset = useRef({ x: 0, y: 0 });
  const [elements, setElements] = useState([]);

  const { user } = useAuth();

  const isUserOwner = isOwner;

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
    if (!projectData) return;

    loadElements();

    let subscription;
    let isMounted = true;

    const setupRealtime = async () => {
      try {
        const channelString = `databases.taski.tables.elements.rows`;

        const sub = await realtime.subscribe(
          channelString,
          (response) => {
            const payload = response.payload;
            const events = response.events;

            // Filter out events that belong to other projects
            if (payload.projectId !== projectData.$id) return;

            setElements((prevElements) => {
              if (events.some(e => e.includes(".create"))) {
                // Prevent duplicate UI glitches if this user made the card
                if (prevElements.some((el) => el.$id === payload.$id)) return prevElements;
                return [...prevElements, payload];
              }

              if (events.some(e => e.includes(".update"))) {
                return prevElements.map((el) =>
                  el.$id === payload.$id ? payload : el
                );
              }

              if (events.some(e => e.includes(".delete"))) {
                return prevElements.filter((el) => el.$id !== payload.$id);
              }

              return prevElements;
            });
          }
        );

        if (!isMounted) {
          sub.close();
        } else {
          subscription = sub;
          console.log("Realtime subscription opened");
        }
      } catch (error) {
        console.error("Failed to subscribe to realtime updates:", error);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.close();
        console.log("Realtime subscription closed");
      }
    };
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
      //Check if the realtime socket already added it before the HTTP request finished!
      setElements((prev) => {
        if (prev.some((el) => el.$id === res.$id)) return prev;
        return [...prev, res];
      });
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
            isPanning: panning,
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