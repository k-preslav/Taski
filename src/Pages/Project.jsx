import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar/TopBar";
import { ID, tablesDB, Query, realtime } from "../appwrite/config";
import GithubIcon from "../components/GithubIcon";
import { FrownIcon, LockIcon } from "lucide-react";
import Button from "../components/Button/Button";
import Spinner from "../components/Spinner/Spinner";
import ProjectSettings from "../components/ProjectSettings/ProjectSettings";
import Canvas from "../components/Canvas/Canvas";

function Project() {
  const { checkUser, user } = useAuth();
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [isUserOwner, setIsUserOwner] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setHasPermission(true);
      await checkUser();

      if (!projectId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await tablesDB.getRow({
          databaseId: "taski",
          tableId: "projects",
          rowId: projectId,
        });

        const isOwnerOrCollab =
          response.ownerId === user.$id ||
          (response.collabIds && response.collabIds.includes(user.$id));

        if (isMounted) {
          setIsUserOwner(isOwnerOrCollab);

          if (!response.isPublic && !isOwnerOrCollab) {
            setHasPermission(false);
            setIsLoading(false);
            return;
          }

          setProjectData(response);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setProjectData(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectData || !user) return;

    let subscription;
    let isMounted = true;

    const setupRealtime = async () => {
      try {
        const channelString = `databases.taski.collections.projects.documents.${projectData.$id}`;

        const sub = await realtime.subscribe(
          channelString,
          (response) => {
            const payload = response.payload;
            let events = response.events;
            events = Array.isArray(events) ? events : Object.values(events || {});

            if (events.some(e => e.includes(".update"))) {
              if (isMounted) {
                setProjectData(payload);

                const isOwnerOrCollab =
                  payload.ownerId === user.$id ||
                  (payload.collabIds && payload.collabIds.includes(user.$id));

                setIsUserOwner(isOwnerOrCollab);

                if (!payload.isPublic && !isOwnerOrCollab) {
                  setHasPermission(false);
                } else {
                  setHasPermission(true);
                }
              }
            }

            if (events.some(e => e.includes(".delete"))) {
              if (isMounted) {
                setProjectData(null);
                setHasPermission(false);
              }
            }
          }
        );

        if (!isMounted) {
          if (typeof sub === "function") sub();
          else if (sub.close) sub.close();
        } else {
          subscription = sub;
          console.log("Project realtime subscription opened");
        }
      } catch (error) {
        console.error("Failed to subscribe to project realtime updates:", error);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (subscription) {
        if (typeof subscription === "function") subscription();
        else if (subscription.close) subscription.close();
        console.log("Project realtime subscription closed");
      }
    };
  }, [projectData?.$id, user?.$id]);

  const updateProject = async (name, isPublic, collabIds) => {
    setProjectData((prev) => ({ ...prev, name, isPublic, collabIds }));

    await tablesDB.updateRow({
      databaseId: "taski",
      tableId: "projects",
      rowId: projectData.$id,
      data: { name, isPublic, collabIds },
    });
  };

  const deleteProject = async () => {
    setShowProjectSettings(false);
    setIsLoading(true);

    const response = await tablesDB.listRows({
      databaseId: "taski",
      tableId: "elements",
      queries: [Query.equal("projectId", projectData.$id)],
    });

    const deletePromises = response.rows.map((card) =>
      tablesDB.deleteRow({
        databaseId: "taski",
        tableId: "elements",
        rowId: card.$id,
      }),
    );

    await Promise.all(deletePromises);

    await tablesDB.deleteRow({
      databaseId: "taski",
      tableId: "projects",
      rowId: projectData.$id,
    });

    navigate("/projects");
  };

  return (
    <div style={styles.layout}>
      <TopBar
        projectName={projectData?.name}
        projectData={projectData}
        showProjectMenu={!!projectData && isUserOwner}
        onProjectMenuShowProjectSettings={() => setShowProjectSettings(true)}
      />
      <div style={styles.mainContentArea}>
        {isLoading ? (
          <div style={styles.spinnerWrap}>
            <Spinner size={36} color="var(--text-muted)" />
          </div>
        ) : !hasPermission ? (
          <div style={styles.centeredState}>
            <LockIcon size={64} color="var(--text-muted)" />
            <p style={styles.errorText}>Access Denied</p>
            <Button onClick={() => navigate("/projects")}>
              <span style={{ fontSize: "16px", color: "var(--text)" }}>
                Back to Projects
              </span>
            </Button>
          </div>
        ) : !projectData ? (
          <div style={styles.centeredState}>
            <FrownIcon size={64} color="var(--text-muted)" />
            <p style={styles.errorText}>Project not found</p>
            <Button onClick={() => navigate("/projects")}>
              <span style={{ fontSize: "16px", color: "var(--text)" }}>
                Back to Projects
              </span>
            </Button>
          </div>
        ) : (
          <>
            <Canvas projectData={projectData} isOwner={isUserOwner} />
            {showProjectSettings && (
              <ProjectSettings
                project={projectData}
                onClose={() => setShowProjectSettings(false)}
                onSave={(name, isPublic, collabIds) => {
                  updateProject(name, isPublic, collabIds);
                }}
                onDelete={deleteProject}
              />
            )}
          </>
        )}
      </div>
      <GithubIcon />
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    backgroundColor: "var(--bg)",
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  mainContentArea: {
    display: "flex",
    flexDirection: "row",
    height: "calc(100vh - 56px)",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  spinnerWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
  },
  errorText: {
    fontSize: "24px",
    fontWeight: "500",
    color: "var(--text-muted)",
    marginBottom: "26px",
  },
};

export default Project;