import React, { useState, useEffect } from "react";
import { CrownIcon } from "lucide-react";
import { tablesDB, storage, realtime } from "../appwrite/config";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner/Spinner";

const BUCKET_ID = import.meta.env.VITE_APPWRITE_IMAGES_BUCKET_ID;

export default function AccountBubble({ size = 36, onClick, isOwner, accountId }) {
  const [accountIdData, setAccountIdData] = useState(null);
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);

  const targetAccountId = accountId || user?.$id;

  useEffect(() => {
    if (!targetAccountId) return;

    const fetchAccountData = async () => {
      setIsLoading(true);

      try {
        const response = await tablesDB.getRow({
          databaseId: "taski",
          tableId: "accounts",
          rowId: targetAccountId
        });
        setAccountIdData(response);

        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      } catch (error) {
        console.error("Failed to load account data for ID:", targetAccountId, error);
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [targetAccountId]);

  useEffect(() => {
    if (!targetAccountId) return;

    let isMounted = true;
    let subscription;

    const setupRealtime = async () => {
      try {
        const channelString = `databases.taski.collections.accounts.documents`;

        subscription = await realtime.subscribe(channelString, (response) => {
          if (!isMounted) return;

          const payload = response.payload;
          let events = response.events;
          events = Array.isArray(events) ? events : Object.values(events || {});

          if (payload.$id === targetAccountId) {
            if (events.some((e) => e.includes(".update"))) {
              setAccountIdData(payload);
            }
          }
        });
      } catch (error) {
        console.error("Failed to subscribe to account updates:", error);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (subscription) {
        if (typeof subscription === "function") subscription();
        else if (subscription.close) subscription.close();
      }
    };
  }, [targetAccountId]);

  const initial = accountIdData?.name ? accountIdData.name.charAt(0).toUpperCase() : "";
  const avatarId = accountIdData?.avatarId;

  const avatarUrl = avatarId
    ? storage.getFileView({ bucketId: BUCKET_ID, fileId: avatarId })
    : null;

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
  };

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
    background: avatarUrl ? "transparent" : "linear-gradient(180deg, #FB6603 0%, #2854E5 100%)",
    margin: isOwner ? "0" : "0px 4px",
    overflow: "hidden",
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

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: 'fill',
  };

  const renderBubbleContent = () => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt={`${initial} avatar`} style={imageStyle} />;
    }
    return <span style={textStyle}>{initial}</span>;
  };

  if (isLoading) {
    return <div style={{ width: diameter, height: diameter, margin: "4px", justifyContent: "center", alignItems: "center", display: "flex" }}><Spinner size={diameter * 0.5} /></div>;
  }

  if (!isOwner) {
    return (
      <div style={bubbleStyle} onClick={onClick} aria-label="Account">
        {renderBubbleContent()}
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
        {renderBubbleContent()}
      </div>
    </div>
  );
}