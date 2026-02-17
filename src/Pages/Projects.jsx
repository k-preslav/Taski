import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar/TopBar";
import ProjectButton from "../components/ProjectButton/ProjectButton";
import { useAuth } from "../context/AuthContext";
import AddButton from "../components/AddButton/AddButton";
import { ID, Query, tablesDB } from "../appwrite/config";
import { useNavigate } from "react-router-dom";
import { SquircleDashedIcon } from "lucide-react";
import GithubIcon from "../components/GithubIcon";
import Spinner from "../components/Spinner/Spinner";

export default function Projects() {
  const { user, checkUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getProjects = async () => {
    if (!user?.$id) return;
    try {
      setIsLoading(true);
      const response = await tablesDB.listRows({
        databaseId: "taski",
        tableId: "projects",
        queries: [Query.equal("ownerId", user.$id)],
      });

      setTimeout(() => {
        setProjects(response.rows);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const addProject = () => {
    const tempId = `temp-${Date.now()}`;
    const newProj = { $id: tempId, name: "", isTemp: true };
    setProjects((prev) => [...prev, newProj]);
  };

  const handleSave = async (oldId, newName) => {
    try {
      const realId = ID.unique();
      const response = await tablesDB.createRow({
        databaseId: "taski",
        tableId: "projects",
        rowId: realId,
        data: {
          name: newName,
          ownerId: user.$id,
        },
      });

      setProjects((prev) =>
        prev.map((p) =>
          p.$id === oldId ? { ...response, name: newName, isTemp: false } : p,
        ),
      );
    } catch (error) {
      console.error("Failed to save project:", error);
      setProjects((prev) => prev.filter((p) => p.$id !== oldId));
    }
  };

  useEffect(() => {
    checkUser();
    getProjects();
  }, [user?.$id]);

  return (
    <div style={styles.pageWrapper}>
      <TopBar showProjectMenu={false} />

      <div style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.heading}>My Projects</h1>

          <div style={styles.card}>
            <div style={styles.listContainer}>
              {isLoading ? (
                <div style={styles.centerBox}>
                  <Spinner color="#666" />
                </div>
              ) : projects.length > 0 ? (
                <div style={styles.grid}>
                  {projects.map((project) => (
                    <ProjectButton
                      key={project.$id}
                      name={project.name}
                      onSave={(newName) => handleSave(project.$id, newName)}
                      onClick={() => {
                        if (project.isTemp) return;
                        navigate(`/project/${project.$id}`);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={styles.centerBox}>
                  <SquircleDashedIcon size={32} color="#444" />
                  <p style={styles.emptyText}>No projects yet</p>
                </div>
              )}
            </div>

            <div style={styles.footer}>
              <AddButton onClick={addProject} />
            </div>
          </div>
        </div>
      </div>

      <GithubIcon />
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#1a1a1a",
    display: "flex",
    flexDirection: "column",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  container: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "32px",
    textAlign: "left",
  },
  card: {
    backgroundColor: "#242424",
    borderRadius: "16px",
    border: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    height: "480px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  listContainer: {
    padding: "20px",
    overflowY: "auto",
    flex: 1,
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  centerBox: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  emptyText: {
    color: "#595959",
    fontSize: "14px",
    fontWeight: "500",
    margin: 0,
  },
  footer: {
    padding: "16px",
    borderTop: "1px solid #333",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
    flexShrink: 0,
  },
};
