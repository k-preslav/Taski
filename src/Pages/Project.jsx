import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar/TopBar";
import SideBar from "../components/Sidebar";
import { ID, tablesDB, Query } from "../appwrite/config";
import GithubIcon from "../components/GithubIcon";

function Project() {
  const { checkUser } = useAuth();
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [cards, setCards] = useState([]);

  const getCards = async () => {
    if (!projectId) return;

    try {
      const response = await tablesDB.listRows({
        databaseId: "taski",
        tableId: "cards",
        queries: [Query.equal("projectId", projectId)],
      });

      // Merge server rows with any client-only flags from previous local state
      setCards((prev) => {
        const prevMap = (prev || []).reduce((m, c) => {
          if (c && c.$id) m[c.$id] = c;
          return m;
        }, {});
        return (response.rows || []).map((row) => {
          const prevCard = prevMap[row.$id];
          return {
            ...row,
            // preserve local-only `edit` flag if present
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
      await checkUser();
      if (!projectId) return;

      try {
        const response = await tablesDB.getRow({
          databaseId: "taski",
          tableId: "projects",
          rowId: projectId,
        });

        if (isMounted) {
          setProjectData(response);
          getCards();
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
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
      // Remove the optimistic card on failure
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
      <SideBar
        onAddTask={() => handleAddTask(true)}
        projectData={projectData}
        cards={cards}
        setCards={setCards}
      />

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
};

export default Project;
