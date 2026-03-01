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

  const targetScale = useRef(1);
  const currentScale = useRef(1);
  const currentCamera = useRef({ x: 0, y: 0 });
  const zoomOrigin = useRef({ x: 0, y: 0 });
  const animFrameId = useRef(null);

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;

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
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startAnimatedZoom, animateZoom]);

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

    if (!isMousePan && !isTouchPan) return;

    setPanning(true);
    panOffset.current = { x: e.clientX - currentCamera.current.x, y: e.clientY - currentCamera.current.y };
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
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
    setPanning(false);
    if (canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
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

  return (
    <div
      ref={wrapperRef}
      style={styles.wrapper}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
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
              onCardClick: handleElementZIndex
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
    position: "absolute",
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