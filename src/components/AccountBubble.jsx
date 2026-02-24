import React, { useState, useEffect } from "react";
import { CrownIcon } from "lucide-react";
import { tablesDB } from "../appwrite/config"; 
import { useAuth } from "../context/AuthContext";

export default function AccountBubble({ size = 36, onClick, isOwner, accountId }) {
  const [accountIdData, setAccountIdData] = useState(null);
  const {user} = useAuth();

  useEffect(() => {
    if (!accountId) accountId = user?.$id;

    const fetchAccountData = async () => {
      try {
        const response = await tablesDB.getRow({
          databaseId: "taski",
          tableId: "accounts",
          rowId: accountId
        });
        setAccountIdData(response);
      } catch (error) {
        console.error("Failed to load account data for ID:", accountId, error);
      }
    };

    fetchAccountData();
  }, [accountId]);

  const initial = accountIdData?.name ? accountIdData.name.charAt(0).toUpperCase() : "";
  const diameter = typeof size === "number" ? size : 36;
  const fontSize = Math.round(diameter * 0.45);

  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: 'space-between',
    gap: "8px",
    padding: "4px 4px 4px 12px",
    backgroundColor: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "100px",
    cursor: onClick ? "pointer" : "default",
    userSelect: "none",
  };

  const iconStyle = {
    transform: "translateY(1px)",
    marginRight: "2px",
  }

  const bubbleStyle = {
    width: diameter,
    height: diameter,
    minWidth: diameter,
    minHeight: diameter,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    cursor: onClick ? "pointer" : "default",
    userSelect: "none",
    background: "linear-gradient(180deg, #FB6603 0%, #2854E5 100%)",
    margin: isOwner ? "0" : "0px 4px",
  };

  const textStyle = {
    color: "#fff",
    fontWeight: 500,
    fontStyle: "italic",
    fontFamily: '"Rubik", system-ui, -apple-system, sans-serif',
    fontSize: `${fontSize}px`,
    lineHeight: 1,
    transform: "translateY(0.5px) translateX(-1.5px)",
  };

  if (!isOwner) {
    return (
      <div style={bubbleStyle} onClick={onClick} aria-label="Account">
        <span style={textStyle}>{initial}</span>
      </div>
    );
  }

  return (
    <div style={pillStyle} onClick={onClick} aria-label="Owner Account">
      <CrownIcon 
        size={fontSize * 1.15} 
        color="var(--accent2)" 
        strokeWidth={2}
        style={iconStyle}
      />
      <div style={bubbleStyle}>
        <span style={textStyle}>{initial}</span>
      </div>
    </div>
  );
}