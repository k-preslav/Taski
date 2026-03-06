import React, { useState, useRef, useEffect } from "react";
import {
  ChartNoAxesGanttIcon,
  LaptopMinimalCheckIcon,
  Settings2Icon,
  ChevronDown,
  UserRoundCogIcon,
  LogOutIcon,
  Sun,
  Moon,
  BadgeQuestionMarkIcon,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import AccountBubble from "../AccountBubble";
import VerticalSep from "../VerticalSep";
import "./TopBar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CollabPanel from "./CollabPanel";
import { tablesDB } from "../../appwrite/config";
import HowToUse from "../HowToUse/HowToUse";

export default function TopBar({
  projectName,
  projectData,
  showProjectMenu = true,
  showAccountIcon = true,
  onProjectMenuShowProjectSettings,
}) {
  const [openProjectMenu, setOpenProjectMenu] = useState(false);
  const [openAccountMenu, setOpenAccountMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const projectRef = useRef(null);
  const accountRef = useRef(null);

  const [showHowToUse, setShowHowToUse] = useState(false);

  const isOwner = projectData?.ownerId === user?.$id;

  const disableHowToUse = async () => {
    setShowHowToUse(false);
    if (!user) return;

    try {
      await tablesDB.updateRow({
        databaseId: "taski",
        tableId: "accounts",
        rowId: user.$id,
        data: { showHowToUse: false },
      }); 
    } catch (err) {
      console.error("Failed to update how-to-use preference:", err);
    }
  }

  useEffect(() => {
    if (!user?.$id) return;
    if (!projectData) return;
    
    tablesDB.getRow({
      databaseId: "taski",
      tableId: "accounts",
      rowId: user.$id,
    }).then((res) => {
      if (res.showHowToUse) {
        setShowHowToUse(true);
      }
    }).catch((err) => {
      console.error("Failed to fetch how-to-use preference:", err);
    });
  }, [user, projectData]);

  useEffect(() => {
    updateUserThemePref();
  }, [theme]);

  const updateUserThemePref = async () => {
    if (!user) return;

    try {
      await tablesDB.updateRow({
        databaseId: "taski",
        tableId: "accounts",
        rowId: user.$id,
        data: { theme },
      });
    } catch (err) {
      console.error("Failed to update theme preference:", err);
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (projectRef.current && !projectRef.current.contains(e.target)) {
        setOpenProjectMenu(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setOpenAccountMenu(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenProjectMenu(false);
        setOpenAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="brand" onClick={() => navigate("/projects")}>
          <LaptopMinimalCheckIcon className="brand__icon" size={22} color="var(--text)" />
          <h1 className="brand__title">Taski</h1>
        </div>

        {showProjectMenu && (
          <>
            <VerticalSep />
            <div
              className="project-selector"
              ref={projectRef}
              onClick={() => setOpenProjectMenu(!openProjectMenu)}
            >
              <span className="project-selector__name">
                {projectName || "Loading..."}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: openProjectMenu ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />

              {openProjectMenu && (
                <div className="dropdown-menu">
                  <button
                    className="menu-item"
                    onClick={onProjectMenuShowProjectSettings}
                  >
                    <Settings2Icon size={16} />
                    Project Settings
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => navigate("/projects")}
                  >
                    <ChartNoAxesGanttIcon size={16} />
                    All Projects
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="topbar__right" ref={accountRef}>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {showAccountIcon && (
          <>
            {!user && projectData?.requireLogin === false ? (
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            ) : user && (
              <>
                {projectData?.collabIds?.length > 0 && <CollabPanel projectData={projectData} />}
                <AccountBubble onClick={() => setOpenAccountMenu(!openAccountMenu)} isOwner={isOwner} />
              </>
            )}
          </>
        )}

        {openAccountMenu && user && (
          <div className="dropdown-menu dropdown-menu--right">
            <div className="menu-label">{user?.name || "Guest"}</div>
            <div className="menu-divider" />
            <button
              className="menu-item"
              onClick={() => {
                setOpenAccountMenu(false);
                navigate("/accountSettings");
              }}
            >
              <UserRoundCogIcon size={18} />
              Account Settings
            </button>
            <button
              className="menu-item"
              onClick={() => {
                setOpenAccountMenu(false);
                setShowHowToUse(true);
              }}
            >
              <BadgeQuestionMarkIcon size={18} style={{ transform: 'translateX(-2px)' }} />
              How to Use
            </button>
            <button
              className="menu-item menu-item--danger"
              onClick={() => {
                setOpenAccountMenu(false);
                logout();
                navigate("/login");
              }}
            >
              <LogOutIcon size={18} />
              Log Out
            </button>
          </div>
        )}
      </div>

      {showHowToUse && <HowToUse onClose={() => { disableHowToUse() }} />}
    </header>
  );
}
