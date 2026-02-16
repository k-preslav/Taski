import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar/TopBar";
import ProjectButton from "../components/ProjectButton/ProjectButton";
import { useAuth } from "../context/AuthContext";
import AddButton from "../components/AddButton/AddButton";
import { ID, Query, tablesDB } from "../appwrite/config";
import { useNavigate } from "react-router-dom";
import {
  PartyPopperIcon,
  SquircleDashed,
  SquircleDashedIcon,
} from "lucide-react";
import GithubIcon from "../components/GithubIcon";

export default function Projects() {
  const { checkUser } = useAuth();
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  const getProjects = async () => {
    try {
      const response = await tablesDB.listRows({
        databaseId: "taski",
        tableId: "projects",
        queries: [Query.equal("ownerId", user.$id)],
      });
      setProjects(response.rows);
    } catch (error) {
      console.error(error);
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
  }, []);

  return (
    <div style={styles.page}>
      <TopBar showProjectMenu={false} />
      <div style={styles.content}>
        <p style={styles.header}>My Projects</p>
        <div style={styles.projects}>
          <div style={styles.listContainer}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectButton
                  key={project.$id}
                  name={project.name}
                  onSave={(newName) => handleSave(project.$id, newName)}
                  onClick={() => {
                    if (project.isTemp) return;
                    navigate(`/project/${project.$id}`);
                  }}
                />
              ))
            ) : (
              <div style={styles.noProjects}>
                <SquircleDashedIcon
                  size={36}
                  strokeWidth={1.7}
                  color="#696969"
                />
                <p style={{ color: "#696969", transform: "translateX(-8px)" }}>
                  No projects here, yet
                </p>
              </div>
            )}
          </div>
          <div style={styles.bottom}>
            <AddButton onClick={addProject} />
          </div>
        </div>
      </div>

      <GithubIcon />
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#222",
  },
  content: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  header: {
    fontSize: "42px",
    fontWeight: "500",
    marginBottom: "10vh",
    color: "white",
    userSelect: "none",
  },
  projects: {
    width: "20vw",
    height: "55vh",
    minWidth: "320px",
    backgroundColor: "#282828",
    display: "flex",
    borderRadius: "10px",
    padding: "10px",
    flexDirection: "column",
  },
  listContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  bottom: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "center",
    transform: "translateY(7px)",
  },

  noProjects: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    gap: "12px",
    fontSize: "18px",
    fontStyle: "italic",
    fontWeight: "500",
  },
};
