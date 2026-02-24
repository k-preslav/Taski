import React, { useState, useEffect, useRef } from "react";
import { X, Trash2, Save, Settings2, Search, Plus } from "lucide-react";
import Confirmation from "../Confirmation/Confirmation";
import AccountBubble from "../AccountBubble";
import { tablesDB, Query } from "../../appwrite/config";
import "./ProjectSettings.css";

export default function ProjectSettings({
  project,
  onSave,
  onDelete,
  onClose,
}) {
  const [name, setName] = useState(project?.name || "");
  const [isPublic, setIsPublic] = useState(project?.isPublic || false);
  const [collabIds, setCollabIds] = useState(project?.collabIds || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [collabUsers, setCollabUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchTerm("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchExistingCollabs = async () => {
      if (!project?.collabIds || project.collabIds.length === 0) return;
      try {
        const response = await tablesDB.listRows({
          databaseId: "taski",
          tableId: "accounts",
          queries: [Query.equal("$id", project.collabIds)],
        });
        setCollabUsers(response.rows);
      } catch (error) {
        console.error(error);
      }
    };
    fetchExistingCollabs();
  }, [project?.collabIds]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await tablesDB.listRows({
          databaseId: "taski",
          tableId: "accounts",
          queries: [
            Query.startsWith("name", searchTerm),
            Query.limit(5)
          ],
        });

        const filteredResults = response.rows.filter(
          (u) => !collabIds.includes(u.$id) && u.$id !== project?.ownerId && u.isAnon !== true
        );

        setSearchResults(filteredResults);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchTerm, collabIds, project?.ownerId]);

  const handleAddCollab = (user) => {
    setCollabIds((prev) => [...prev, user.$id]);
    setCollabUsers((prev) => [...prev, user]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveCollab = (userId) => {
    setCollabIds((prev) => prev.filter((id) => id !== userId));
    setCollabUsers((prev) => prev.filter((u) => u.$id !== userId));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = () => {
    onSave(name, isPublic, collabIds);
    handleClose();
  };

  return (
    <>
      <aside className={`project-settings ${isClosing ? "closing" : ""}`}>
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Settings2 size={18} color="var(--text)" />
            <span className="settings-header__title">Settings</span>
          </div>
          <X
            size={20}
            color="var(--text-muted)"
            style={{ cursor: "pointer" }}
            onClick={handleClose}
          />
        </div>

        <div className="settings-content">
          <div className="settings-group">
            <label className="settings-label">PROJECT NAME</label>
            <input
              className="settings-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">VISIBILITY</label>
            <div className="pill-toggle">
              <div
                className={`pill-toggle__slider ${isPublic ? "pill-toggle__slider--right" : ""}`}
              />
              <button
                type="button"
                className={`pill-toggle__btn ${!isPublic ? "is-active" : ""}`}
                onClick={() => setIsPublic(false)}
              >
                Private
              </button>
              <button
                type="button"
                className={`pill-toggle__btn ${isPublic ? "is-active" : ""}`}
                onClick={() => setIsPublic(true)}
              >
                Public
              </button>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">COLLABORATORS</label>

            <div className="search-container" ref={searchContainerRef}>
              <div className="settings-search-wrapper">
                <Search size={14} color="var(--text-muted)" className="search-icon" />
                <input
                  className="settings-input settings-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name..."
                />
              </div>

              {searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map((u) => (
                    <div
                      key={u.$id}
                      className="search-result-item"
                      onClick={() => handleAddCollab(u)}
                    >
                      <div className="search-result-info">
                        <AccountBubble accountId={u.$id} size={28} />
                        <span className="result-name">{u.name}</span>
                      </div>
                      <Plus size={16} className="add-icon" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="collab-list">
              {collabUsers.length > 0 ? (
                collabUsers.map((u) => (
                  <div key={u.$id} className="collab-item">
                    <div className="collab-info">
                      <AccountBubble accountId={u.$id} size={28} />
                      <span className="collab-name">{u.name}</span>
                    </div>
                    <button
                      className="collab-remove-btn"
                      onClick={() => handleRemoveCollab(u.$id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="collab-empty">
                  <span>No collaborators added</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn" onClick={handleSave}>
            <Save size={16} />
            Save Changes
          </button>

          <button className="btn-danger" onClick={() => setShowConfirm(true)}>
            <Trash2 size={16} />
            Delete Project
          </button>
        </div>
      </aside>

      {showConfirm && (
        <Confirmation
          title="Are you sure you want to delete this project?"
          confirmText="Delete Project"
          isDestructive={true}
          onConfirm={onDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}