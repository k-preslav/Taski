import React, { useState, useRef, useEffect, useCallback } from "react";
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
}) {
  const [openProjectMenu, setOpenProjectMenu] = useState(false);
  const [openAccountMenu, setOpenAccountMenu] = useState(false);

  const { user, logout } = useAuth();

  const projectRef = useRef(null);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      const target = e.target;
      if (projectRef.current && !projectRef.current.contains(target)) {
        setOpenProjectMenu(false);
      }
      if (accountRef.current && !accountRef.current.contains(target)) {
        setOpenAccountMenu(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") {
        setOpenProjectMenu(false);
        setOpenAccountMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const menuItems = [
    {
      id: "settings",
      label: "Project Settings",
      icon: <Settings2Icon size={18} />,
      onClick: () => console.log("Opening settings"),
    },
    {
      id: "all",
      label: "All Projects",
      icon: <ChartNoAxesGanttIcon size={18} />,
      onClick: () => navigate("/projects"),
    },
  ];

  return (
    <header className="topbar">
      <div className="header">
        <LaptopMinimalCheckIcon className="header__icon" size={26} />
        <h1 className="header__title">Taski</h1>

        {showProjectMenu && (
          <div
            ref={projectRef}
            className="header__right"
            tabIndex={0}
            role="button"
            aria-haspopup="menu"
            aria-expanded={openProjectMenu}
            onClick={() => setOpenProjectMenu((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenProjectMenu((prev) => !prev);
              }
            }}
          >
            <VerticalSep />
            <span className="header__project-name">{projectName || ""}</span>
            <ChevronDown size={16} className="chevron-button" />

            {openProjectMenu && (
              <div
                className="project-menu"
                role="menu"
                aria-label="Project menu"
              >
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    className="project-menu__item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                      setOpenProjectMenu(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        item.onClick();
                        setOpenProjectMenu(false);
                      }
                    }}
                  >
                    <span className="project-menu__icon">{item.icon}</span>
                    <span className="project-menu__label">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {openAccountMenu && (
        <div
          ref={accountRef}
          id="account-menu"
          className="account-menu"
          role="menu"
          aria-label="Account menu"
        >
          <div className="account-menu__label" aria-hidden="true">
            {user?.name || "Guest"}
          </div>

          <div
            className="account-menu__divider"
            aria-hidden="true"
            style={{
              height: "1px",
              background: "#404040",
              margin: "6px 0",
              width: "100%",
              borderRadius: "1px",
            }}
          />

          <button
            className="account-menu__item"
            role="menuitem"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setOpenAccountMenu(false);
              navigate("/accountSettings");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setOpenAccountMenu(false);
              }
            }}
          >
            <UserRoundCogIcon size={20} />
            <span className="account-menu__label">Account Settings</span>
          </button>
          <button
            className="account-menu__item"
            style={{ backgroundColor: "#7E3737", marginTop: "6px" }}
            role="menuitem"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setOpenAccountMenu(false);
              logout();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setOpenAccountMenu(false);
              }
            }}
          >
            <LogOutIcon size={20} />
            <span className="account-menu__label">Log Out</span>
          </button>
        </div>
      )}

      {showAccountIcon && (
        <div className="header__account">
          <AccountBubble
            onClick={() => setOpenAccountMenu((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={openAccountMenu}
            aria-controls="account-menu"
          />
        </div>
      )}
    </header>
  );
}
