import React from "react";
import { PlusCircleIcon } from "lucide-react";
import "./AddButton.css";

export default function AddButton({ onClick }) {
  return (
    <div className="add-button" onClick={onClick}>
      <div className="add-button-line"></div>
      <PlusCircleIcon size={20} color="currentColor" strokeWidth={2.5} />
      <div className="add-button-line"></div>
    </div>
  );
}
