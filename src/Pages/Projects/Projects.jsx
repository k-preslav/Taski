import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import ProjectButton from "../../components/ProjectButton/ProjectButton";
import { useAuth } from "../../context/AuthContext";
import AddButton from "../../components/AddButton/AddButton";
import { ID, Query, tablesDB } from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { SquircleDashedIcon } from "lucide-react";
import GithubIcon from "../../components/GithubIcon";
import Spinner from "../../components/Spinner/Spinner";

import "./Projects.css";

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
    <div className="projects-page">
      <TopBar showProjectMenu={false} />

      <div className="projects-main">
        <div className="projects-container">
          <h1 className="projects-heading">My Projects</h1>

          <div className="projects-card">
            <div className="projects-list">
              {isLoading ? (
                <div className="projects-center">
                  <Spinner color="var(--text-muted)" />
                </div>
              ) : projects.length > 0 ? (
                <div className="projects-grid">
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
                <div className="projects-center">
                  <SquircleDashedIcon size={32} color="var(--border)" />
                  <p className="projects-empty-text">No projects yet</p>
                </div>
              )}
            </div>

            <div className="projects-footer">
              <AddButton onClick={addProject} />
            </div>
          </div>
        </div>
      </div>

      <GithubIcon />
    </div>
  );
}

