import React from "react";
import Card from "./Card/Card";
import AddButton from "./AddButton/AddButton";
import { PartyPopperIcon } from "lucide-react";

export default function SideBar({ onAddTask, cards, setCards }) {
  const handleDoubleClick = (e) => {
    if (
      e.target === e.currentTarget ||
      e.target.id === "sidebar-scroll-container"
    ) {
      onAddTask();
    }
  };

  return (
    <div style={styles.sidebar} onDoubleClick={handleDoubleClick}>
      <p style={styles.headerText}>Backlog</p>

      <div id="sidebar-scroll-container" style={styles.cardList}>
        {cards.filter((task) => task.isBacklog === true).length > 0 ? (
          cards
            .filter((task) => task.isBacklog === true)
            .map((task, index) => (
              <Card
                key={task.$id}
                id={task.$id}
                text={task.content}
                style={{ animationDelay: `${index * 0.015}s` }}
                edit={task.edit}
                onDestroy={() => {
                  setCards((prevCards) =>
                    prevCards.filter((card) => card.$id !== task.$id),
                  );
                }}
              />
            ))
        ) : (
          <div style={styles.noBacklog} onDoubleClick={handleDoubleClick}>
            <PartyPopperIcon size={36} strokeWidth={1.7} color="#696969" />
            <p style={{ color: "#696969", transform: "translateX(-8px)" }}>
              All cleared!
            </p>
          </div>
        )}
      </div>

      <div style={styles.bottom}>
        <AddButton onClick={onAddTask} />
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "295px",
    height: "100vh",
    position: "relative",
    boxSizing: "border-box",
    backgroundColor: "#1B1B1B",
    borderRight: "2px solid #2c2c2c",
    padding: "8px 12px 60px 12px",
    display: "flex",
    flexDirection: "column",
  },

  headerText: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "500",
    marginBottom: "8px",
    transform: "translateX(1px)",
  },

  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
    flex: 1,
  },

  noBacklog: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    gap: "10px",
    fontSize: "18px",
    fontStyle: "italic",
    fontWeight: "500",
    userSelect: "none",
  },

  bottom: {
    position: "absolute",
    bottom: "4px",
    left: "12px",
    right: "12px",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
  },
};
