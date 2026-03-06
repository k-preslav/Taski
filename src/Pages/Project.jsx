import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar/TopBar";
import { tablesDB } from "../appwrite/config";
import { Query, ID } from "appwrite";
import { useRealtime } from "../context/RealtimeContext";
import GithubIcon from "../components/GithubIcon";
import { FrownIcon, LockIcon } from "lucide-react";
import Button from "../components/Button/Button";
import Spinner from "../components/Spinner/Spinner";
import ProjectSettings from "../components/ProjectSettings/ProjectSettings";
import Canvas from "../components/Canvas/Canvas";
import ContactIcon from "@/components/ContactIcon";

function Project() {
  const { checkUser, user, loading: authLoading } = useAuth();
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const navigate = useNavigate();
  const { addListener, removeListener } = useRealtime();
  const [elementRealtimeEvent, setElementRealtimeEvent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setHasPermission(true);
      setNeedsAuth(false);

      if (!projectId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        // First, try to load the project data
        const response = await tablesDB.getRow({
          databaseId: "taski",
          tableId: "projects",
          rowId: projectId,
        });

        // Check if this is a public project that doesn't require login
        const isPublicNoAuth = response.isPublic && response.requireLogin === false;

        // Wait for auth check to complete
        if (!authLoading) {
          await checkUser();
        }

        // Determine ownership/collaboration status if user exists
        const isOwnerOrCollab = user ? (
          response.ownerId === user.$id ||
          (response.collabIds && response.collabIds.includes(user.$id))
        ) : false;

        // If it's public and doesn't require login, allow access
        if (isPublicNoAuth) {
          if (isMounted) {
            setProjectData(response);
            setIsUserOwner(isOwnerOrCollab);
            setHasPermission(true);
            setIsLoading(false);
          }
          return;
        }

        // For projects that require login, check authentication
        if (!user) {
          if (isMounted) {
            setNeedsAuth(true);
            setIsLoading(false);
          }
          return;
        }

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
  }, [projectId, authLoading]);

  useEffect(() => {
    if (!projectData?.$id) return;

    const projectListenerId = addListener("projects", (payload, events) => {
      if (payload.$id !== projectId) return;

      if (events.some((e) => e.includes(".update"))) {
        setProjectData(payload);
        const isPublicNoAuth = payload.isPublic && payload.requireLogin === false;
        if (isPublicNoAuth) {
          setIsUserOwner(false);
          setHasPermission(true);
        } else if (user) {
          const isOwnerOrCollab =
            payload.ownerId === user.$id ||
            (payload.collabIds && payload.collabIds.includes(user.$id));
          setIsUserOwner(isOwnerOrCollab);
          setHasPermission(!payload.isPublic && !isOwnerOrCollab ? false : true);
        } else {
          setNeedsAuth(true);
          setHasPermission(false);
        }
      }
      if (events.some((e) => e.includes(".delete"))) {
        setProjectData(null);
        setHasPermission(false);
      }
    });

    const elementListenerId = addListener("elements", (payload, events) => {
      if (payload.projectId !== projectData.$id) return;
      setElementRealtimeEvent({ payload, events });
    });

    return () => {
      removeListener("projects", projectListenerId);
      removeListener("elements", elementListenerId);
    };
  }, [projectData?.$id, user?.$id, projectId]);

  const updateProject = async (name, isPublic, requireLogin, collabIds) => {
    setProjectData((prev) => ({ ...prev, name, isPublic, requireLogin, collabIds }));

    await tablesDB.updateRow({
      databaseId: "taski",
      tableId: "projects",
      rowId: projectData.$id,
      data: { name, isPublic, requireLogin, collabIds },
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
        ) : needsAuth ? (
          <div style={styles.centeredState}>
            <LockIcon size={64} color="var(--text-muted)" />
            <p style={styles.errorText}>Login Required</p>
            <Button onClick={() => navigate("/login")}>
              <span style={{ fontSize: "16px", color: "var(--text)" }}>
                Go to Login
              </span>
            </Button>
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
            <Canvas
              projectData={projectData}
              isOwner={isUserOwner}
              realtimeEvent={elementRealtimeEvent}
            />
            {showProjectSettings && (
              <ProjectSettings
                project={projectData}
                onClose={() => setShowProjectSettings(false)}
                onSave={(name, isPublic, requireLogin, collabIds) => {
                  updateProject(name, isPublic, requireLogin, collabIds);
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