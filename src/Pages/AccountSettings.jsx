import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar/TopBar";
import GithubIcon from "../components/GithubIcon";
import AccountBubble from "../components/AccountBubble";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button/Button";
import Spinner from "../components/Spinner/Spinner";
import { LogOutIcon, PencilIcon, ChevronLeft, Check } from "lucide-react";
import { account, tablesDB } from "../appwrite/config";

export default function AccountSettings() {
  const { user, logout, checkUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dbUser, setDbUser] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchDbAccount = async () => {
      if (!user?.$id) return;
      try {
        const data = await tablesDB.getRow({
          databaseId: "taski",
          tableId: "accounts",
          rowId: user.$id,
        });
        setDbUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDbAccount();
  }, [user]);

  useEffect(() => {
    if (isEditing) {
      setNameInput(user?.name || "");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing, user]);

  const save = async () => {
    const val = nameInput.trim();
    if (!val || val === user?.name) return setIsEditing(false);
    
    setIsSaving(true);
    try {
      await account.updateName(val);
      await tablesDB.updateRow({
        databaseId: "taski",
        tableId: "accounts",
        rowId: user.$id,
        data: { name: val },
      });
      await checkUser();
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <TopBar showProjectMenu={false} />
        <div style={styles.center}>
          <Spinner size={32} color="var(--text-muted)" />
        </div>
      </div>
    );
  }

  const isAnon = user?.anonymous || dbUser?.isAnon === true;

  return (
    <div style={styles.pageWrapper}>
      <TopBar showProjectMenu={false} />

      <div style={styles.container}>
        <div style={styles.navRow} onClick={() => navigate("/projects")}>
          <ChevronLeft size={18} />
          <span>Back to Projects</span>
        </div>

        <h1 style={styles.heading}>Account Settings</h1>

        <div style={styles.card}>
          <AccountBubble size={64} accountId={user?.$id} />

          <div style={styles.infoSection}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Display Name</label>
              <div style={styles.nameRow}>
                {!isEditing ? (
                  <>
                    <span style={styles.nameText}>{user?.name || "Guest"}</span>
                    {!isAnon && (
                      <PencilIcon
                        size={14}
                        style={styles.editIcon}
                        onClick={() => setIsEditing(true)}
                      />
                    )}
                  </>
                ) : (
                  <div style={styles.inputWrapper}>
                    <input
                      ref={inputRef}
                      style={styles.input}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isSaving}
                    />
                    {isSaving ? (
                      <Spinner size={14} color="var(--accent)" />
                    ) : (
                      <Check size={16} style={styles.saveIcon} onClick={save} />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.emailText}>
                {user?.email || (isAnon ? "Anonymous Session" : "No Email")}
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}
          </div>
        </div>

        <Button style={styles.logoutBtn} onClick={logout}>
          <LogOutIcon size={18} />
          <span>Log Out</span>
        </Button>
      </div>
      <GithubIcon />
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: "480px",
    padding: "100px 20px 0 20px",
    display: "flex",
    flexDirection: "column",
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "24px",
    width: "fit-content",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "600",
    color: "var(--text)",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "var(--surface)",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    border: "1px solid var(--border)",
  },
  infoSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "11px",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    fontWeight: "700",
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "24px",
  },
  nameText: {
    fontSize: "18px",
    color: "var(--text)",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  },
  input: {
    fontSize: "18px",
    color: "var(--text)",
    background: "none",
    border: "none",
    outline: "none",
    padding: 0,
    width: "100%",
    borderBottom: "1px solid var(--accent)",
  },
  editIcon: { color: "var(--text-muted)", cursor: "pointer" },
  saveIcon: { color: "var(--accent)", cursor: "pointer" },
  emailText: { fontSize: "16px", color: "var(--text-muted)" },
  divider: { height: "1px", backgroundColor: "var(--border)", width: "100%" },
  logoutBtn: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--danger)",
    marginTop: "32px",
    padding: "12px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    borderRadius: "8px",
  },
  error: { color: "var(--danger)", fontSize: "13px", marginTop: "8px" }
};