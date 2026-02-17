import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar/TopBar";
import SideBar from "../components/Sidebar/Sidebar";
import { ID, tablesDB, Query } from "../appwrite/config";
import GithubIcon from "../components/GithubIcon";
import { FrownIcon, LockIcon } from "lucide-react";
import Button from "../components/Button/Button";
import Spinner from "../components/Spinner/Spinner";
import ProjectSettings from "../components/ProjectSettings/ProjectSettings";

function Project() {
  const { checkUser, user } = useAuth();
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [isUserOwner, setIsUserOwner] = useState(false);

  const navigate = useNavigate();

  const getCards = async () => {
    if (!projectId) return;
    try {
      const response = await tablesDB.listRows({
        databaseId: "taski",
        tableId: "cards",
        queries: [Query.equal("projectId", projectId)],
      });

      setCards((prev) => {
        const prevMap = (prev || []).reduce((m, c) => {
          if (c && c.$id) m[c.$id] = c;
          return m;
        }, {});
        return (response.rows || []).map((row) => {
          const prevCard = prevMap[row.$id];
          return {
            ...row,
            edit: !!(prevCard && prevCard.edit),
          };
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

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

        if (!response.isPublic && response.ownerId !== user.$id) {
          if (isMounted) {
            setHasPermission(false);
            setIsLoading(false);
          }
          return;
        }

        if (response.ownerId === user.$id) {
          setIsUserOwner(true);
        }

        if (isMounted) {
          setProjectData(response);
          await getCards();
        }
      } catch {
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

  const handleAddTask = async (isBacklog) => {
    if (!projectId) return;
    const tempId = ID.unique();
    const newCard = {
      $id: tempId,
      content: "",
      isBacklog,
      projectId,
      edit: true,
    };
    setCards((prev) => [...prev, newCard]);
    try {
      await tablesDB.createRow({
        databaseId: "taski",
        tableId: "cards",
        rowId: tempId,
        data: {
          content: newCard.content,
          isBacklog: newCard.isBacklog,
          projectId: newCard.projectId,
        },
      });
      await getCards();
    } catch (error) {
      setCards((prev) => prev.filter((card) => card.$id !== tempId));
    }
  };

  const updateProject = async (name, isPublic) => {
    setShowProjectSettings(false);

    await tablesDB.updateRow({
      databaseId: "taski",
      tableId: "projects",
      rowId: projectData.$id,
      data: { name, isPublic },
    });
    setProjectData((prev) => ({ ...prev, name, isPublic }));
  };

  const deleteProject = async () => {
    setShowProjectSettings(false);
    setIsLoading(true);

    // 1. Fetch all cards associated with this project
    const response = await tablesDB.listRows({
      databaseId: "taski",
      tableId: "cards",
      queries: [Query.equal("projectId", projectData.$id)],
    });

    // 2. Delete each card
    const deletePromises = response.rows.map((card) =>
      tablesDB.deleteRow({
        databaseId: "taski",
        tableId: "cards",
        rowId: card.$id,
      }),
    );

    await Promise.all(deletePromises);

    // 3. Delete the project itself
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
        showProjectMenu={!!projectData && isUserOwner}
        onProjectMenuShowProjectSettings={() => setShowProjectSettings(true)}
      />
      <div style={styles.mainContentArea}>
        {isLoading ? (
          <div style={styles.spinnerWrap}>
            <Spinner size={36} color="#666" />
          </div>
        ) : !hasPermission ? (
          <div style={styles.centeredState}>
            <LockIcon size={64} color="#666" />
            <p style={styles.errorText}>Access Denied</p>
            <Button onClick={() => navigate("/projects")}>
              <span style={{ fontSize: "16px", color: "#fff" }}>
                Back to Projects
              </span>
            </Button>
          </div>
        ) : !projectData ? (
          <div style={styles.centeredState}>
            <FrownIcon size={64} color="#666" />
            <p style={styles.errorText}>Project not found</p>
            <Button onClick={() => navigate("/projects")}>
              <span style={{ fontSize: "16px", color: "#fff" }}>
                Back to Projects
              </span>
            </Button>
          </div>
        ) : (
          <>
            <SideBar
              onAddTask={() => handleAddTask(true)}
              projectData={projectData}
              cards={cards}
              setCards={setCards}
            />
            <div style={styles.canvas} />
            {showProjectSettings && (
              <ProjectSettings
                project={projectData}
                onClose={() => setShowProjectSettings(false)}
                onSave={(name, isPublic) => {
                  updateProject(name, isPublic);
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
    backgroundColor: "#1a1a1a",
    overflow: "hidden",
  },
  mainContentArea: {
    display: "flex",
    flexDirection: "row",
    height: "calc(100vh - 56px)",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
    height: "100%",
    overflow: "auto",
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
    color: "#666",
    marginBottom: "26px",
  },
};

export default Project;
