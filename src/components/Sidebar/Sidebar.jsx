import React from "react";
import Card from "../Card/Card";
import AddButton from "../AddButton/AddButton";
import { PartyPopperIcon } from "lucide-react";
import "./Sidebar.css";

export default function SideBar({ onAddTask, cards, setCards }) {
  const handleDoubleClick = (e) => {
    if (
      e.target === e.currentTarget ||
      e.target.id === "sidebar-scroll-container"
    ) {
      onAddTask();
    }
  };

  const backlogCards = cards.filter((task) => task.isBacklog === true);

  return (
    <div className="sidebar" onDoubleClick={handleDoubleClick}>
      <p className="headerText">Backlog</p>

      <div id="sidebar-scroll-container" className="cardList">
        {backlogCards.length > 0 ? (
          backlogCards.map((task, index) => (
            <Card
              key={task.$id}
              id={task.$id}
              text={task.content}
              style={{
                animationDelay: task.edit ? "0s" : `${0.3 + index * 0.015}s`,
              }}
              edit={task.edit}
              onDestroy={() => {
                setCards((prevCards) =>
                  prevCards.filter((card) => card.$id !== task.$id),
                );
              }}
            />
          ))
        ) : (
          <div className="noBacklog" onDoubleClick={handleDoubleClick}>
            <PartyPopperIcon
              size={36}
              strokeWidth={1.7}
              color="#444"
              style={{ transform: "translateX(8px)" }}
            />
            <p className="noBacklogText">All cleared!</p>
          </div>
        )}
      </div>

      <div className="bottom">
        <AddButton onClick={onAddTask} />
      </div>
    </div>
  );
}
