import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import ProjectButton from "../../components/ProjectButton/ProjectButton";
import { useAuth } from "../../context/AuthContext";
import AddButton from "../../components/AddButton/AddButton";
import { ID, Query, tablesDB, realtime } from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { ListIcon, SquircleDashedIcon, CrownIcon, UsersIcon } from "lucide-react";
import GithubIcon from "../../components/GithubIcon";
import Spinner from "../../components/Spinner/Spinner";

import "./Projects.css";

export default function Projects() {
  const { user, checkUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const getProjects = async () => {
    if (!user?.$id) return;
    try {
      setIsLoading(true);

      const ownedPromise = tablesDB.listRows({
        databaseId: "taski",
        tableId: "projects",
        queries: [Query.equal("ownerId", user.$id)],
      });

      const collabPromise = tablesDB.listRows({
        databaseId: "taski",
        tableId: "projects",
        queries: [Query.contains("collabIds", user.$id)],
      });

      const [ownedResponse, collabResponse] = await Promise.all([
        ownedPromise,
        collabPromise,
      ]);

      const combinedProjects = [...ownedResponse.rows, ...collabResponse.rows];
      const uniqueProjects = Array.from(
        new Map(combinedProjects.map((p) => [p.$id, p])).values()
      );

      setTimeout(() => {
        setProjects(uniqueProjects);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const addProject = () => {
    const tempId = `temp-${Date.now()}`;
    const newProj = { $id: tempId, name: "", isTemp: true, ownerId: user.$id };
    setProjects((prev) => [...prev, newProj]);
    setFilter("all");
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
      console.error(error);
      setProjects((prev) => prev.filter((p) => p.$id !== oldId));
    }
  };

  useEffect(() => {
    checkUser();
    getProjects();
  }, [user?.$id]);

  useEffect(() => {
    if (!user?.$id) return;

    let isMounted = true;
    let subscription;

    const setupRealtime = async () => {
      try {
        const channelString = `databases.taski.collections.projects.documents`;

        subscription = await realtime.subscribe(channelString, (response) => {
          if (!isMounted) return;

          const payload = response.payload;
          let events = response.events;
          events = Array.isArray(events) ? events : Object.values(events || {});

          const isRelevant =
            payload.ownerId === user.$id ||
            (payload.collabIds && payload.collabIds.includes(user.$id));

          setProjects((prevProjects) => {
            const projectExists = prevProjects.some((p) => p.$id === payload.$id);

            if (events.some((e) => e.includes(".create"))) {
              if (isRelevant && !projectExists) {
                return [...prevProjects, payload];
              }
            }

            if (events.some((e) => e.includes(".update"))) {
              if (isRelevant) {
                if (projectExists) {
                  return prevProjects.map((p) => (p.$id === payload.$id ? payload : p));
                } else {
                  return [...prevProjects, payload];
                }
              } else {
                if (projectExists) {
                  return prevProjects.filter((p) => p.$id !== payload.$id);
                }
              }
            }

            if (events.some((e) => e.includes(".delete"))) {
              if (projectExists) {
                return prevProjects.filter((p) => p.$id !== payload.$id);
              }
            }

            return prevProjects;
          });
        });
      } catch (error) {
        console.error(error);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (subscription) {
        if (typeof subscription === "function") subscription();
        else if (subscription.close) subscription.close();
      }
    };
  }, [user?.$id]);

  const displayedProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "owned") return project.ownerId === user.$id;
    if (filter === "collab") return project.ownerId !== user.$id;
    return true;
  });

  return (
    <div className="projects-page">
      <TopBar showProjectMenu={false} />

      <div className="projects-main">
        <div className="projects-container">
          <div className="projects-header">
            <h1 className="projects-heading">My Projects</h1>
            <div className="projects-sort-container">
              <button
                className={`projects-sort-button ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
                data-tooltip="All Projects"
              >
                <ListIcon size={16} color="currentColor" />
              </button>
              <div className="projects-sort-divider" />
              <button
                className={`projects-sort-button ${filter === "owned" ? "active" : ""}`}
                onClick={() => setFilter("owned")}
                data-tooltip="Owned by Me"
              >
                <CrownIcon size={16} color="currentColor" />
              </button>
              <button
                className={`projects-sort-button ${filter === "collab" ? "active" : ""}`}
                onClick={() => setFilter("collab")}
                data-tooltip="Shared with Me"
              >
                <UsersIcon size={16} color="currentColor" />
              </button>
            </div>
          </div>

          <div className="projects-card">
            <div className="projects-list">
              {isLoading ? (
                <div className="projects-center">
                  <Spinner color="var(--text-muted)" />
                </div>
              ) : displayedProjects.length > 0 ? (
                <div className="projects-grid">
                  {displayedProjects.map((project) => (
                    <ProjectButton
                      key={project.$id}
                      isOwner={project.ownerId === user.$id}
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
                  <p className="projects-empty-text">
                    {filter === "all"
                      ? "No projects yet"
                      : filter === "owned"
                        ? "No owned projects"
                        : "No shared projects"}
                  </p>
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