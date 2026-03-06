import React from 'react'
import "./HowToUse.css";
import { BadgeQuestionMarkIcon } from 'lucide-react';

function HowToUse({ onClose }) {
  return (
    <div className='howToContainer' onClick={onClose}>
      <div className='helpPanel' onClick={(e) => e.stopPropagation()}>
        <div className='helpHeader'>
          <BadgeQuestionMarkIcon size={32} strokeWidth={3} />
          <h2 className='helpTitle'>How to Use</h2>
        </div>
        
        <hr className='separator' />
        
        <div className='helpSection'>
          <div className='info'>
            <h3>Create a new card</h3>
            <p className='description'>Drag a card from the tools panel and drop it on the canvas.</p>
            
            <hr className='separator' />
            
            <div className='markdownGuide'>
              <p className='guideTitle'>Markdown syntax:</p>
              <div className='syntaxList'>
                <div className='syntaxItem'>
                  <code>-</code>
                  <span>Bullet points</span>
                </div>
                <div className='syntaxItem'>
                  <code>#</code>
                  <span>Headers</span>
                </div>
                <div className='syntaxItem'>
                  <code>[ ]</code>
                  <span>Checkboxes</span>
                </div>
                <div className='syntaxItem'>
                  <code>---</code>
                  <span>Horizontal line</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className='gifContainer'>
            <img src="/drag_drop.gif" alt="Drag and Drop Example" className='helpGif' />
          </div>
        </div>
        
        <button className='gotItButton' onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}

export default HowToUse