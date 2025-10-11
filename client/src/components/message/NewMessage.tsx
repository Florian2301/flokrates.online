import './NewMessage.css';

import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useRef, useState } from 'react';
import { changeMessage, deleteMessageThunk } from '../../store/messagesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { Actor } from '../../types/ActorStyles';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

type NewMessageProps = {
  messageId: number;
  onCancel: () => void;
};

const NewMessage: React.FC<NewMessageProps> = ({ messageId, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(
    (state: RootState) => state.messages.selectedmessages
  );
  const message = messages.find((m) => m.messageId === messageId)!;
  const maxMessageNumber = messages.length;
  const [editedText, setEditedText] = useState(message.messageText);
  const [selectedActor, setSelectedActor] = useState(message.actor);
  const [selectedMessageNumber, setSelectedMessageNumber] = useState(
    message.messageNumber
  );
  const [respMessageId, setRespMessageId] = useState<number | null>(
    message.respId
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  function handleEmojiSelect(emoji: any) {
    setEditedText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  }

  const handleSave = () => {
    dispatch(
      changeMessage({
        messageId,
        updatedText: editedText,
        newActor: selectedActor,
        newMessageNumber: selectedMessageNumber,
        oldMessageNumber: message.messageNumber,
        responseId: respMessageId,
      })
    );
    onCancel();
  };

  const handleDelete = () => {
    dispatch(deleteMessageThunk(message.messageId));
    onCancel();
  };

  useEffect(() => {
    function handleSaveEvent(e: Event) {
      const customEvent = e as CustomEvent<{ id: number }>;
      if (customEvent.detail.id === message.messageId) {
        handleSave();
      }
    }

    window.addEventListener('save-message', handleSaveEvent);
    return () => {
      window.removeEventListener('save-message', handleSaveEvent);
    };
  }, [
    message.messageId,
    editedText,
    selectedActor,
    selectedMessageNumber,
    respMessageId,
  ]);

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
        <div className="emoji-section">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-popup">
              <Picker
                date={data}
                onEmojiSelect={(emoji: any) => handleEmojiSelect(emoji)}
                previewPosition="none"
                skinTonePosition="none"
                theme="light"
                sheetSize={32}
              />
            </div>
          )}
        </div>
        <label className="newMessage-label" id="number-label">
          <section id="number">#{selectedMessageNumber}</section> -&gt;
          <select
            className="newMessage-select"
            value={'-'}
            onChange={(e) => setSelectedMessageNumber(Number(e.target.value))}
          >
            <option value="-" disabled hidden>
              -
            </option>
            {Array.from({ length: maxMessageNumber }, (_, i) => i + 1)
              .filter((num) => {
                if (!respMessageId) return true;
                const respMsg = messages.find(
                  (m) => m.messageId === respMessageId
                );
                if (!respMsg) return true;
                return num > respMsg.messageNumber;
              })
              .map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
          </select>
        </label>

        <label className="newMessage-label">
          Re:
          <span className="current-reply" id="number">
            {respMessageId
              ? `#${messages.find((m) => m.messageId === respMessageId)?.messageNumber}`
              : '0'}
          </span>
          -&gt;
          <select
            className="newMessage-select"
            value={respMessageId ?? '-'}
            onChange={(e) =>
              setRespMessageId(
                e.target.value === '-' ? null : Number(e.target.value)
              )
            }
          >
            <option value="-">-</option>
            {[...messages]
              .filter((msg) => msg.messageNumber < selectedMessageNumber)
              .sort((a, b) => a.messageNumber - b.messageNumber)
              .map((msg) => (
                <option key={msg.messageId} value={msg.messageId}>
                  {msg.messageNumber}
                </option>
              ))}
          </select>
        </label>
        <button className="newMessage-btn" id="save-btn" onClick={handleSave}>
          Save
        </button>
        <button className="newMessage-btn" onClick={handleDelete}>
          Delete
        </button>
        <button className="newMessage-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NewMessage;
