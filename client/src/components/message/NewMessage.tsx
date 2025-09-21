import './NewMessage.css';

import React, { useEffect, useRef, useState } from 'react';

import { Actor } from '../../types/ActorStyles';

type NewMessageProps = {
  messageId: number;
  initialText: string;
  onCancel: () => void;
  initialActor: Actor;
  initialMessageNumber: number;
  onDelete: () => void;
  maxMessageNumber: number;
  onSave: (
    messageId: number,
    newText: string,
    newActor: Actor,
    newMsgNumber: number,
    oldMsgNumber: number,
    responseId: number
  ) => void;
};

const NewMessage: React.FC<NewMessageProps> = ({
  messageId,
  initialText,
  onSave,
  onCancel,
  initialActor,
  initialMessageNumber,
  onDelete,
  maxMessageNumber,
}) => {
  const [editedText, setEditedText] = useState(initialText);
  const [selectedActor, setSelectedActor] = useState(initialActor);
  const [selectedMessageNumber, setSelectedMessageNumber] =
    useState(initialMessageNumber);
  const [respMessageNumber, setRespMessageNumber] = useState(
    initialMessageNumber - 1
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 100 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  function startDrag(e: React.MouseEvent<HTMLDivElement>) {
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };

    window.addEventListener('mousemove', onDrag as any);
    window.addEventListener('mouseup', stopDrag as any);
  }

  function onDrag(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initX + dx,
      y: dragRef.current.initY + dy,
    });
  }

  function stopDrag() {
    setDragging(false);
    dragRef.current = null;
    window.removeEventListener('mousemove', onDrag as any);
    window.removeEventListener('mouseup', stopDrag as any);
  }

  function keyEventMessage(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.code === 'Escape') {
      onCancel();
    }
  }

  useEffect(() => {
    adjustHeight();
  }, [editedText]);

  function adjustHeight() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }

  useEffect(() => {
    console.log(
      'selectedMessageNumber hat sich geändert:',
      setSelectedMessageNumber(selectedMessageNumber),
      selectedMessageNumber
    );
  }, [selectedMessageNumber]);

  return (
    <div
      className="new-message-window"
      style={{
        top: `${position.y}px`,
        left: '50%',
        transform: `translateX(calc(-50% + ${position.x}px))`,
      }}
      onMouseDown={startDrag}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div
        className="header"
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        style={{ padding: '8px', background: '#eee' }}
      ></div>
      <textarea
        ref={textareaRef}
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        onInput={adjustHeight}
        onKeyDown={keyEventMessage}
      />
      <div className="actions" onMouseDown={startDrag} onMouseMove={onDrag}>
        <label className="newMessage-label">
          Name
          <select
            className="newMessage-select"
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value as Actor)}
          >
            <option value="FLO">Flokrates</option>
            <option value="PAB">Pablo</option>
            <option value="LOT">Lotharius</option>
          </select>
        </label>
        <label className="newMessage-label" id="number-label">
          <section id="number"># {initialMessageNumber}</section> -&gt;
          <select
            className="newMessage-select"
            value={selectedMessageNumber}
            onChange={(e) => setSelectedMessageNumber(Number(e.target.value))}
          >
            {Array.from({ length: maxMessageNumber }, (_, i) => i + 1).map(
              (num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              )
            )}
          </select>
        </label>

        <label className="newMessage-label">
          Reply to:
          <select
            className="newMessage-select"
            value={respMessageNumber}
            onChange={(e) => setRespMessageNumber(Number(e.target.value))}
          >
            {Array.from({ length: maxMessageNumber }, (_, i) => i + 1).map(
              (num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              )
            )}
          </select>
        </label>
        <button
          className="newMessage-btn"
          id="save-btn"
          onClick={() =>
            onSave(
              messageId,
              editedText,
              selectedActor,
              selectedMessageNumber,
              initialMessageNumber,
              respMessageNumber
            )
          }
        >
          Save
        </button>
        {onDelete && (
          <button className="newMessage-btn" onClick={onDelete}>
            Delete
          </button>
        )}
        <button className="newMessage-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NewMessage;
