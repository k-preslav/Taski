import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ImageCard.css";
import { tablesDB, storage } from "../../appwrite/config";
import { ID } from "appwrite";
import { ImageMinusIcon, Trash2Icon, XIcon } from "lucide-react";
import Confirmation from "../Confirmation/Confirmation";

const BUCKET_ID = import.meta.env.VITE_APPWRITE_IMAGES_BUCKET_ID;

function ImageCard({ cardData: elementData, camera, isPanning, onCardClick, zIndex, onDelete, isUserOwner }) {
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  const [position, setPosition] = useState({ x: elementData.x || 0, y: elementData.y || 0 });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(elementData.title || "");

  const [draftImage, setDraftImage] = useState(elementData.imageId || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // NEW: State to control the full-screen image preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    setDraftTitle(elementData.title || "");
    setDraftImage(elementData.imageId || null);
  }, [elementData.title, elementData.imageId]);

  useEffect(() => {
    if (!dragging) {
      setPosition({ x: elementData.x || 0, y: elementData.y || 0 });
    }
  }, [elementData.x, elementData.y]);

  const updateCardData = async (data = {}) => {
    if (!isUserOwner) return;

    try {
      await tablesDB.updateRow({
        databaseId: "taski",
        tableId: "elements",
        rowId: elementData.$id,
        data: {
          title: draftTitle,
          imageId: draftImage,
          x: position.x,
          y: position.y,
          zIndex: zIndex,
          ...data,
        },
      });
    } catch (error) {
      console.error("Failed to update image card:", error);
    }
  };

  const deleteCard = async (cardId) => {
    if (!isUserOwner) return;

    try {
      onDelete(cardId);

      if (draftImage) {
        await storage.deleteFile({
          bucketId: BUCKET_ID,
          fileId: draftImage
        });
      }

      await tablesDB.deleteRow({ databaseId: "taski", tableId: "elements", rowId: cardId });
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  const saveTitle = async () => {
    if (!isUserOwner) return;
    setEditingTitle(false);
    if (draftTitle === elementData.title) return;
    await updateCardData({ title: draftTitle });
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 || editingTitle || !isUserOwner) return;

    onCardClick(elementData.$id);

    setDragging(true);
    offset.current = { x: e.clientX - position.x - camera.x, y: e.clientY - position.y - camera.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isUserOwner) return;
    if (!dragging) return;
    setPosition({ x: e.clientX - offset.current.x - camera.x, y: e.clientY - offset.current.y - camera.y });
  };

  const handlePointerUp = async (e) => {
    if (!isUserOwner) return;
    if (!dragging) return;
    setDragging(false);
    if (e.target.hasPointerCapture(e.pointerId)) e.target.releasePointerCapture(e.pointerId);
    await updateCardData();
  };

  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const uploadedFile = await storage.createFile({
        bucketId: BUCKET_ID,
        fileId: ID.unique(),
        file: file
      });

      setDraftImage(uploadedFile.$id);
      await updateCardData({ imageId: uploadedFile.$id });

    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    if (!isUserOwner) return;

    const imageIdToDelete = draftImage;

    try {
      setDraftImage(null);
      await updateCardData({ imageId: null });

      if (imageIdToDelete) {
        await storage.deleteFile({
          bucketId: BUCKET_ID,
          fileId: imageIdToDelete
        });
      }
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  };

  const imageUrl = draftImage ? storage.getFileView({
    bucketId: BUCKET_ID,
    fileId: draftImage
  }) : null;

  return (
    <>
      <div
        ref={cardRef}
        className="imageCard"
        style={{
          transform: `translate(${position.x + camera.x}px, ${position.y + camera.y}px)`,
          zIndex: zIndex,
          transition: (dragging || isPanning) ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="header"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={handlePointerDown}
          onDoubleClick={(e) => {
            if (!isUserOwner) return;
            e.stopPropagation();
            setEditingTitle(true);
          }}
        >
          {editingTitle ? (
            <input
              autoFocus
              className="titleEditor"
              spellCheck={false}
              autoComplete="off"
              value={draftTitle}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => setDraftTitle(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setEditingTitle(false);
                  setDraftTitle(elementData.title);
                }
              }}
            />
          ) : (
            <span className="headerText">{draftTitle || "Untitled Card"}</span>
          )}

          {isUserOwner && (
            <div className="headerRight">
              <div
                className="deleteButton"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
              >
                <Trash2Icon size={16} color="var(--danger)" style={{ transform: "translateY(3px)" }} />
              </div>
            </div>
          )}
        </div>

        <div
          className="imageWrap"
          onClick={(e) => {
            if (!isUserOwner || isUploading) return;
            e.stopPropagation();
            
            if (imageUrl) {
              // Open modal instead of a new tab
              setIsPreviewOpen(true);
            } else {
              fileInputRef.current?.click();
            }
          }}
          style={{ cursor: isUserOwner && !isUploading ? "pointer" : "default" }}
        >
          {isUploading ? (
            <div className="imagePlaceholder">Uploading...</div>
          ) : imageUrl ? (
            <>
              <img src={imageUrl} alt={draftTitle || "image"} className="imagePreview" />
              
              {isUserOwner && (
                <div
                  className="imageRemoveOverlay"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    removeImage();
                  }}
                  title="Remove Image"
                >
                  <ImageMinusIcon size={18} color="var(--text)" />
                </div>
              )}
            </>
          ) : (
            <div className="imagePlaceholder">Click to upload image</div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        {showDeleteConfirm && (
          <Confirmation
            title="Are you sure you want to delete this card?"
            confirmText="Delete Card"
            isDestructive={true}
            onConfirm={() => {
              if (!isUserOwner) return;
              setShowDeleteConfirm(false);
              deleteCard(elementData.$id);
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </div>

      {isPreviewOpen && imageUrl && createPortal(
        <div 
          className="imageModalOverlay" 
          onClick={() => setIsPreviewOpen(false)}
          onPointerDown={(e) => e.stopPropagation()} 
          onPointerUp={(e) => e.stopPropagation()}
        >
          <button className="imageModalClose" onClick={() => setIsPreviewOpen(false)}>
            <XIcon size={24} color="#fff" />
          </button>
          
          <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt={draftTitle || "Preview"} className="imageModalImg" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ImageCard;