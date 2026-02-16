import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar/TopBar";
import SideBar from "../components/Sidebar/Sidebar";
import { ID, tablesDB, Query } from "../appwrite/config";
import GithubIcon from "../components/GithubIcon";
import { FrownIcon, Loader2Icon } from "lucide-react";
import Button from "../components/Button/Button";
import Spinner from "../components/Spinner/Spinner";

function Project() {
  const { checkUser, user } = useAuth();
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      console.error("Failed to fetch cards:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
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

        if (response.ownerId !== user.$id) {
          navigate("/projects");
        }

        if (isMounted) {
          setProjectData(response);
          await getCards();
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
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
      edit: true, // client-only flag to keep it in edit mode immediately
    };

    // Show the optimistic card in UI
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
      console.error("Creation failed:", error);
      setCards((prev) => prev.filter((card) => card.$id !== tempId));
      alert("Failed to add task. Please try again.");
    }
  };

  return (
    <div style={styles.layout}>
      <TopBar
        projectName={projectData?.name}
        showProjectMenu={projectData?.name || false}
      />

      {isLoading ? (
        <div style={styles.spinnerWrap}>
          <Spinner size={36} color="#696969" />
        </div>
      ) : projectData?.name == null ? (
        <div style={styles.projectNoExisto}>
          <FrownIcon size={64} color="#696969" />
          <p
            style={{
              fontSize: "24px",
              fontWeight: "500",
              color: "#696969",
              marginBottom: "26px",
            }}
          >
            This project no longer exist
          </p>

          <Button onClick={() => navigate("/projects")}>
            <p style={{ fontSize: "16px", fontWeight: "400", color: "#fff" }}>
              See all projects
            </p>
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
        </>
      )}
      <GithubIcon />
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    backgroundColor: "#222222",
  },
  projectNoExisto: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    fontSize: "24px",
    color: "#fff",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
};

export default Project;
