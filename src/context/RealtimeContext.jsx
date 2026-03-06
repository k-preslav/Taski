import React, { createContext, useContext, useEffect, useRef } from "react";
import { realtime } from "../appwrite/config";

/**
 * A single, persistent WebSocket connection for the entire app.
 *
 * The Appwrite SDK creates a new WebSocket every time subscribe() is called or
 * a subscription is closed. To avoid constant reconnect loops, this context
 * opens ONE subscription to all channels we ever need, and lets components
 * register/unregister plain JS callbacks without touching the socket at all.
 *
 * Usage:
 *   const { addListener, removeListener } = useRealtime();
 *
 *   useEffect(() => {
 *     const id = addListener("projects", (payload, events) => { ... });
 *     return () => removeListener("projects", id);
 *   }, []);
 *
 * Channel keys: "projects" | "elements"
 */

const RT_CHANNELS = [
  "tablesdb.taski.tables.projects.rows",
  "tablesdb.taski.tables.elements.rows",
];

// Map from channel key to the table substring for matching
const CHANNEL_MATCH = {
  projects: ".projects.",
  elements: ".elements.",
};

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  // listeners: { [channelKey]: Map<id, callback> }
  const listeners = useRef({ projects: new Map(), elements: new Map() });
  const nextId = useRef(0);

  useEffect(() => {
    let unsubscribe = null;

    const setup = async () => {
      try {
        unsubscribe = await realtime.subscribe(RT_CHANNELS, (response) => {
          const payload = response.payload;
          const events = Array.isArray(response.events)
            ? response.events
            : Object.values(response.events || {});
          const channels = Array.isArray(response.channels)
            ? response.channels
            : Object.values(response.channels || {});

          // Determine which channel this belongs to and fire listeners
          for (const [key, match] of Object.entries(CHANNEL_MATCH)) {
            if (channels.some((c) => c.includes(match))) {
              listeners.current[key].forEach((cb) => cb(payload, events));
            }
          }
        });
      } catch (err) {
        console.error("RealtimeContext: failed to subscribe", err);
      }
    };

    setup();

    // Intentionally NOT cleaning up the subscription on unmount.
    // This provider lives at the app root and never unmounts in practice.
    // Closing the subscription would cause the SDK to reconnect (the exact
    // problem we're trying to avoid).
  }, []);

  const addListener = (channelKey, callback) => {
    const id = nextId.current++;
    listeners.current[channelKey]?.set(id, callback);
    return id;
  };

  const removeListener = (channelKey, id) => {
    listeners.current[channelKey]?.delete(id);
  };

  return (
    <RealtimeContext.Provider value={{ addListener, removeListener }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
