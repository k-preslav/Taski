import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { account, tablesDB } from "../appwrite/config";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [userId, setUserId] = useState(null);

  const [theme, _setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (err) {
      return "dark";
    }
  });

  const userIdRef = useRef(userId);
  const themeRef = useRef(theme);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    themeRef.current = theme;
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch (err) {}
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserAndTheme = async () => {
      try {
        const activeUser = await account.get();
        if (!isMounted) return;

        setUserId(activeUser.$id);

        const data = await tablesDB.getRow({
          databaseId: "taski",
          tableId: "accounts",
          rowId: activeUser.$id,
        });

        if (data?.theme && isMounted) {
          _setTheme(data.theme);
        }
      } catch (err) {}
    };

    fetchUserAndTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = async (newTheme) => {
    const resolvedTheme = typeof newTheme === "function" ? newTheme(themeRef.current) : newTheme;

    if (resolvedTheme === themeRef.current) return;

    _setTheme(resolvedTheme);

    if (userIdRef.current) {
      try {
        await tablesDB.updateRow({
          databaseId: "taski",
          tableId: "accounts",
          rowId: userIdRef.current,
          data: { theme: resolvedTheme },
        });
      } catch (err) {}
    }
  };

  const toggle = () => {
    setTheme(themeRef.current === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}