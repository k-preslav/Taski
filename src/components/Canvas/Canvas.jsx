import React, { useState, useRef, useEffect, useCallback } from "react";
import Card from "../Element_Card/Card";
import TextElement from "../Element_Text/TextElement";
import client, { Query, realtime, tablesDB } from "../../appwrite/config";
import { ID } from "appwrite";
import CanvasTools from "./CanvasTools";
import { useAuth } from "../../context/AuthContext";
import ImageCard from "../Element_ImageCard/ImageCard";

export default function Canvas({ projectData, isOwner }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const panOffset = useRef({ x: 0, y: 0 });
  const wheelTimeout = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionThresholdMet = useRef(false);

  const targetScale = useRef(1);
  const currentScale = useRef(1);
  const currentCamera = useRef({ x: 0, y: 0 });
  const zoomOrigin = useRef({ x: 0, y: 0 });
  const animFrameId = useRef(null);

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;
  const SELECTION_THRESHOLD = 10; // pixels

  const { user } = useAuth();
  const isUserOwner = isOwner;

  const zoomToPoint = useCallback((newScale, originX, originY) => {
    const clamped = Math.min(Math.max(MIN_SCALE, newScale), MAX_SCALE);
    const ratio = clamped / currentScale.current;

    const nextCamera = {
      x: originX - (originX - currentCamera.current.x) * ratio,
      y: originY - (originY - currentCamera.current.y) * ratio,
    };

    currentScale.current = clamped;
    targetScale.current = clamped;
    currentCamera.current = nextCamera;

    setScale(clamped);
    setCamera(nextCamera);
  }, []);

  // Animated zoom toward a fixed origin (used by buttons / keyboard)
  const animateZoom = useCallback(() => {
    const lerpFactor = 0.3;
    const diff = targetScale.current - currentScale.current;

    if (Math.abs(diff) < 0.0005) {
      // Snap to target on last frame
      const ratio = targetScale.current / currentScale.current;
      const finalCamera = {
        x: zoomOrigin.current.x - (zoomOrigin.current.x - currentCamera.current.x) * ratio,
        y: zoomOrigin.current.y - (zoomOrigin.current.y - currentCamera.current.y) * ratio,
      };
      currentScale.current = targetScale.current;
      currentCamera.current = finalCamera;
      setScale(targetScale.current);
      setCamera(finalCamera);
      animFrameId.current = null;
      return;
    }

    const nextScale = currentScale.current + diff * lerpFactor;
    const ratio = nextScale / currentScale.current;

    const nextCamera = {
      x: zoomOrigin.current.x - (zoomOrigin.current.x - currentCamera.current.x) * ratio,
      y: zoomOrigin.current.y - (zoomOrigin.current.y - currentCamera.current.y) * ratio,
    };

    currentScale.current = nextScale;
    currentCamera.current = nextCamera;

    setScale(nextScale);
    setCamera(nextCamera);

    animFrameId.current = requestAnimationFrame(animateZoom);
  }, []);

  const startAnimatedZoom = useCallback((factor, originX, originY) => {
    zoomOrigin.current = { x: originX, y: originY };
    targetScale.current = Math.min(Math.max(MIN_SCALE, targetScale.current * factor), MAX_SCALE);

    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(animateZoom);
    }
  }, [animateZoom]);

  const manualZoomIn = () => {
    startAnimatedZoom(1.2, window.innerWidth / 2, window.innerHeight / 2);
  };

  const manualZoomOut = () => {
    startAnimatedZoom(1 / 1.2, window.innerWidth / 2, window.innerHeight / 2);
  };

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

  const toggleElementSelection = (elementId, isMultiSelect) => {
    if (isMultiSelect) {
      setSelectedElements((prev) => {
        if (prev.includes(elementId)) {
          return prev.filter((id) => id !== elementId);
        } else {
          return [...prev, elementId];
        }
      });
    } else {
      setSelectedElements([elementId]);
    }
  };

  const clearSelection = () => {
    setSelectedElements([]);
  };

  const deleteSelectedElements = async () => {
    if (!isUserOwner || selectedElements.length === 0) return;

    const elementsToDelete = [...selectedElements];
    setSelectedElements([]);

    for (const elementId of elementsToDelete) {
      try {
        removeElement(elementId);
        await tablesDB.deleteRow({
          databaseId: "taski",
          tableId: "elements",
          rowId: elementId,
        });
      } catch (error) {
        console.error("Failed to delete element:", error);
      }
    }
  };

  const loadElements = async () => {
    if (!projectData) return;
    try {
      const res = await tablesDB.listRows({
        databaseId: "taski",
        tableId: "elements",
        queries: [Query.equal("projectId", projectData.$id)],
      });
      setElements(res.rows);
    } catch (error) {
      console.error(error);
    }
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
            let events = response.events;
            events = Array.isArray(events) ? events : Object.values(events || {});

            if (payload.projectId !== projectData.$id) return;

            setElements((prevElements) => {
              if (events.some(e => e.includes(".create"))) {
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

        if (!isMounted) sub.close();
        else subscription = sub;
      } catch (error) {
        console.error(error);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (subscription) subscription.close();
    };
  }, [projectData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Escape to cancel selection or clear selection
      if (e.key === 'Escape') {
        if (isSelecting) {
          e.preventDefault();
          setIsSelecting(false);
          setSelectionBox(null);
          return;
        }
        if (selectedElements.length > 0) {
          e.preventDefault();
          clearSelection();
          return;
        }
      }

      // Delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.length > 0) {
        e.preventDefault();
        deleteSelectedElements();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        const originX = window.innerWidth / 2;
        const originY = window.innerHeight / 2;

        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          startAnimatedZoom(1.2, originX, originY);
        } else if (e.key === '-') {
          e.preventDefault();
          startAnimatedZoom(1 / 1.2, originX, originY);
        } else if (e.key === '0') {
          e.preventDefault();
          zoomOrigin.current = { x: originX, y: originY };
          targetScale.current = 1;
          if (!animFrameId.current) {
            animFrameId.current = requestAnimationFrame(animateZoom);
          }
        } else if (e.key === 'a') {
          // Select all elements
          e.preventDefault();
          setSelectedElements(elements.map((el) => el.$id));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startAnimatedZoom, animateZoom, selectedElements, deleteSelectedElements, elements, isSelecting]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleNativeWheel = (e) => {
      e.preventDefault();

      const isZoomGesture = e.ctrlKey || e.metaKey;

      if (isZoomGesture) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        let delta = e.deltaY;

        if (e.deltaMode === 1) delta *= 16;
        else if (e.deltaMode === 2) delta *= 100;

        delta = Math.max(-150, Math.min(150, delta));

        const newScale =
          currentScale.current * Math.pow(2, -delta / 300);

        zoomToPoint(newScale, cx, cy);

        return;
      }

      const nextCamera = {
        x: currentCamera.current.x - e.deltaX,
        y: currentCamera.current.y - e.deltaY,
      };

      currentCamera.current = nextCamera;
      setCamera(nextCamera);
    };

    wrapper.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", handleNativeWheel);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, [zoomToPoint]);

  const handlePointerDown = (e) => {
    const isMousePan = e.pointerType === "mouse" && (e.button === 2 || e.button === 1);
    const isTouchPan = e.pointerType === "touch" && e.target === canvasRef.current;
    const isCanvasClick = e.target === canvasRef.current && e.button === 0;

    if (isCanvasClick && !isMousePan && !isTouchPan) {
      // Start selection box
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection();
      }
      setIsSelecting(true);
      selectionThresholdMet.current = false;
      const startX = (e.clientX - currentCamera.current.x) / currentScale.current;
      const startY = ((e.clientY - 55) - currentCamera.current.y) / currentScale.current;
      setSelectionBox({ startX, startY, endX: startX, endY: startY });
      canvasRef.current.setPointerCapture(e.pointerId);
      return;
    }

    if (!isMousePan && !isTouchPan) return;

    setPanning(true);
    panOffset.current = { x: e.clientX - currentCamera.current.x, y: e.clientY - currentCamera.current.y };
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isSelecting && selectionBox) {
      const endX = (e.clientX - currentCamera.current.x) / currentScale.current;
      const endY = ((e.clientY - 55) - currentCamera.current.y) / currentScale.current;
      
      // Check if we've moved enough to show the selection box
      if (!selectionThresholdMet.current) {
        const dx = Math.abs(endX - selectionBox.startX) * currentScale.current;
        const dy = Math.abs(endY - selectionBox.startY) * currentScale.current;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > SELECTION_THRESHOLD) {
          selectionThresholdMet.current = true;
        }
      }
      
      setSelectionBox({ ...selectionBox, endX, endY});
      return;
    }

    if (!panning) return;
    if (e.pointerType !== "mouse" && e.pointerType !== "touch") return;

    const nextCamera = {
      x: e.clientX - panOffset.current.x,
      y: e.clientY - panOffset.current.y,
    };

    currentCamera.current = nextCamera;
    setCamera(nextCamera);
  };

  const handlePointerUp = (e) => {
    if (isSelecting && selectionBox) {
      // Finalize selection
      const { startX, startY, endX, endY } = selectionBox;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      // Find elements within selection box
      const selectedIds = elements.filter((el) => {
        const elX = el.x || 0;
        const elY = el.y || 0;
        // Approximate element dimensions based on type
        const elWidth = el.type === 'card' || el.type === 'image' ? 260 : 200;
        const elHeight = el.type === 'card' || el.type === 'image' ? 100 : 45;

        // Check for intersection
        return !(elX + elWidth < minX || elX > maxX || elY + elHeight < minY || elY > maxY);
      }).map(el => el.$id);

      if (e.ctrlKey || e.metaKey) {
        // Add to existing selection
        setSelectedElements((prev) => {
          const combined = [...prev, ...selectedIds];
          return [...new Set(combined)]; // Remove duplicates
        });
      } else {
        setSelectedElements(selectedIds);
      }

      setIsSelecting(false);
      setSelectionBox(null);
      selectionThresholdMet.current = false;
      if (canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
        canvasRef.current.releasePointerCapture(e.pointerId);
      }
      return;
    }

    setPanning(false);
    if (canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = () => {
    setIsSelecting(false);
    setSelectionBox(null);
    setPanning(false);
    selectionThresholdMet.current = false;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const toolType = e.dataTransfer.getData("toolType");
    if (!toolType) return;

    const newX = (e.clientX - camera.x) / scale - 8;
    const newY = (e.clientY - camera.y) / scale - 70;
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
      setElements((prev) => {
        if (prev.some((el) => el.$id === res.$id)) return prev;
        return [...prev, res];
      });
    } catch (error) {
      console.error(error);
    }
  };

  const removeElement = (elementId) => {
    setElements((prev) => prev.filter((el) => el.$id !== elementId));
  };

  const updateElementPosition = useCallback((elementId, newX, newY) => {
    setElements((prev) =>
      prev.map((el) =>
        el.$id === elementId ? { ...el, x: newX, y: newY } : el
      )
    );
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={styles.wrapper}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        ref={canvasRef}
        style={{
          ...styles.canvas,
          backgroundPosition: `${camera.x}px ${camera.y}px`,
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {elements.map((el, index) => {
            const commonProps = {
              camera,
              scale,
              isPanning: panning,
              zIndex: el.zIndex || index + 1,
              onDelete: removeElement,
              onCardClick: handleElementZIndex,
              isSelected: selectedElements.includes(el.$id),
              onToggleSelect: toggleElementSelection,
              selectedElements,
              onUpdatePosition: updateElementPosition,
            };

            switch (el.type) {
              case "card":
                return <Card isUserOwner={isUserOwner} key={el.$id} {...commonProps} cardData={el} />;
              case "text":
                return <TextElement isUserOwner={isUserOwner} key={el.$id} {...commonProps} textData={el} />;
              case "image":
                return <ImageCard isUserOwner={isUserOwner} key={el.$id} {...commonProps} cardData={el} />;
              default:
                return null;
            }
          })}
        </div>

        {/* Selection Box */}
        {selectionBox && selectionThresholdMet.current && (
          <div
            style={{
              position: "absolute",
              left: Math.min(selectionBox.startX, selectionBox.endX) * scale + camera.x,
              top: Math.min(selectionBox.startY, selectionBox.endY) * scale + camera.y,
              width: Math.abs(selectionBox.endX - selectionBox.startX) * scale,
              height: Math.abs(selectionBox.endY - selectionBox.startY) * scale,
              border: "1px solid var(--accent)",
              backgroundColor: "rgba(var(--accent-rgb), 0.08)",
              borderRadius: "8px",
              pointerEvents: "none",
              zIndex: 999999,
            }}
          />
        )}
      </div>

      <div style={styles.zoomControls}>
        <button style={styles.zoomBtn} onClick={manualZoomIn} title="Zoom In">
          +
        </button>
        <button style={styles.zoomBtn} onClick={manualZoomOut} title="Zoom Out">
          -
        </button>
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
    touchAction: "none",
    overscrollBehavior: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  },
  canvas: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `linear-gradient(to right, var(--grid) 1px, transparent 1px), linear-gradient(to bottom, var(--grid) 1px, transparent 1px)`,
    willChange: "transform, background-position, background-size",
  },
  zoomControls: {
    position: "absolute",
    bottom: "72px",
    left: "12px",
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    zIndex: 9999,
  },
  zoomBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: "24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    userSelect: "none",
  }
};