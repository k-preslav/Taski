import React, { useRef } from 'react';
import "./CanvasTools.css";
import { ImageIcon, PanelTopIcon, TypeIcon } from 'lucide-react';

function CanvasTools() {
  const cardGhostRef = useRef(null);
  const textGhostRef = useRef(null);
  const imageGhostRef = useRef(null);

  const handleDragStart = (e, toolType) => {
    e.dataTransfer.setData("toolType", toolType);
    e.dataTransfer.setData("text/plain", toolType);
    e.dataTransfer.effectAllowed = "copy"; 

    let ghostElement;
    if (toolType === 'card') ghostElement = cardGhostRef.current;
    if (toolType === 'text') ghostElement = textGhostRef.current;
    if (toolType === 'image') ghostElement = imageGhostRef.current;

    if (ghostElement) {
      e.dataTransfer.setDragImage(ghostElement, 32, 32);
    }
  };

  return (
    <>
      <div className="tools-container">
        <button 
          className="btn"
          draggable
          onDragStart={(e) => handleDragStart(e, 'card')}
        >
          <PanelTopIcon className='btn-icon' size={21} />
        </button>
        
        <button 
          className="btn"
          draggable
          onDragStart={(e) => handleDragStart(e, 'text')}
        >
          <TypeIcon className='btn-icon' size={21} />
        </button>

        <button 
          className="btn"
          draggable
          onDragStart={(e) => handleDragStart(e, 'image')}
        >
          <ImageIcon className='btn-icon' size={21} />
        </button>
      </div>

      {/* Render the hidden ghosts offscreen using classes */}
      <div className="ghost-container">
        <div ref={cardGhostRef} className="ghost-wrapper">
          <PanelTopIcon size={21} color="var(--text)" />
        </div>
        <div ref={textGhostRef} className="ghost-wrapper">
          <TypeIcon size={21} color="var(--text)" />
        </div>
        <div ref={imageGhostRef} className="ghost-wrapper">
          <ImageIcon size={21} color="var(--text)" />
        </div>
      </div>
    </>
  )
}

export default CanvasTools;