import React from 'react'

import "./CollabPanel.css";
import AccountBubble from '../AccountBubble';
import { useAuth } from '../../context/AuthContext';

function CollabPanel({ projectData }) {
  const { user } = useAuth();

  const displayIdsSet = new Set();

  if (projectData?.ownerId && projectData.ownerId !== user?.$id) {
    displayIdsSet.add(projectData.ownerId);
  }

  const collabIds = projectData?.collabIds || [];
  collabIds.forEach((id) => {
    if (id !== user?.$id) {
      displayIdsSet.add(id);
    }
  });

  const displayIds = Array.from(displayIdsSet);

  const visibleCollabs = displayIds.slice(0, 2);
  
  visibleCollabs.sort((a, b) => {
    if (a === projectData?.ownerId) return 1;
    if (b === projectData?.ownerId) return -1;
    return 0;
  });

  const remainingCount = displayIds.length - 2;

  return (
    <div className="collab-panel">
      {remainingCount > 0 && (
        <div className='more'>
          <p>+{remainingCount}</p>
        </div>
      )}

      {visibleCollabs.map((accountId) => (
        <AccountBubble 
          key={accountId} 
          accountId={accountId} 
          isOwner={projectData?.ownerId === accountId} 
          size={26} 
        />
      ))}
    </div>
  )
}

export default CollabPanel