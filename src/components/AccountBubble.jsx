import React from "react";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { User2Icon } from "lucide-react";

export default function AccountBubble({ size = 36, onClick }) {
  const { user } = useAuth();
  const [initial, setInitial] = useState("");

  useEffect(() => {
    if (user) {
      setInitial(user.name.charAt(0).toUpperCase());
    }
  }, [user]);

  const diameter = typeof size === "number" ? size : 36;
  const fontSize = Math.round(diameter * 0.45);

  const styles = {
    container: {
      width: diameter,
      height: diameter,
      minWidth: diameter,
      minHeight: diameter,
      borderRadius: "50%",
      background: "linear-gradient(180deg, #FB6603 0%, #2854E5 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      cursor: onClick ? "pointer" : "default",
      userSelect: "none",
    },
    initial: {
      color: "#fff",
      fontWeight: 500,
      fontStyle: "italic",
      fontFamily:
        '"Rubik", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: `${fontSize}px`,
      lineHeight: 1,
      transform: "translateY(0.3px) translateX(-1.6px)",
    },
  };

  return (
    <div style={styles.container} onClick={onClick} aria-label="Account">
      <span style={styles.initial}>{initial || ""}</span>
    </div>
  );
}
