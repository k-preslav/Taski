import React, { useState, useRef, useEffect } from "react";
import {
  ChartNoAxesGanttIcon,
  LaptopMinimalCheckIcon,
  Settings2Icon,
  ChevronDown,
  UserRoundCogIcon,
  LogOutIcon,
} from "lucide-react";
import AccountBubble from "../AccountBubble";
import VerticalSep from "../VerticalSep";
import "./TopBar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TopBar({
  projectName,
  showProjectMenu = true,
  showAccountIcon = true,
  onProjectMenuShowProjectSettings,
}) {
  const [openProjectMenu, setOpenProjectMenu] = useState(false);
  const [openAccountMenu, setOpenAccountMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const projectRef = useRef(null);
  const accountRef = useRef(null);

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
          <LaptopMinimalCheckIcon className="brand__icon" size={22} />
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
        {showAccountIcon && (
          <AccountBubble onClick={() => setOpenAccountMenu(!openAccountMenu)} />
        )}

        {openAccountMenu && (
          <div className="dropdown-menu dropdown-menu--right">
            <div className="menu-label">{user?.name || "User Account"}</div>
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
              className="menu-item menu-item--danger"
              onClick={() => {
                setOpenAccountMenu(false);
                logout();
              }}
            >
              <LogOutIcon size={18} />
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
