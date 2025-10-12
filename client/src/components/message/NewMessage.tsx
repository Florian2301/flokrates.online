import './NewMessage.css';

import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useRef, useState } from 'react';
import {
  changeMessage,
  createMessage,
  deleteMessageThunk,
} from '../../store/messagesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { Actor } from '../../types/ActorStyles';
import { Message } from '../../types/Message';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

type NewMessageProps = {
  newMessage?: Message;
  messageId: number;
  isNew?: boolean;
  onCancel: () => void;
};

const NewMessage: React.FC<NewMessageProps> = ({
  messageId,
  isNew,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );
  const messages = useSelector(
    (state: RootState) => state.messages.chatmessages
  );
  const tempMessage: Message = {
    messageId: messageId,
    messageText: '',
    actor: 'FLO',
    messageNumber: messages.length + 1,
    respId: null,
    chatId: selectedChat!.chatId,
  };
  const message = isNew
    ? tempMessage
    : (messages.find((m) => m.messageId === messageId) ?? tempMessage);
  const maxMessageNumber = messages.length;
  const initialText = isNew ? '' : message.messageText;
  const initialActor = isNew ? 'FLO' : message.actor;
  const initialNumber = isNew ? messages.length + 1 : message.messageNumber;
  const initialRespId = isNew ? null : message.respId;
  const [editedText, setEditedText] = useState(initialText);
  const [selectedActor, setSelectedActor] = useState(initialActor);
  const [selectedMessageNumber, setSelectedMessageNumber] =
    useState(initialNumber);
  const [respMessageId, setRespMessageId] = useState<number | null>(
    initialRespId
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
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };

    window.addEventListener('mousemove', onDrag as any);
    window.addEventListener('mouseup', stopDrag as any);
  };

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initX + dx,
      y: dragRef.current.initY + dy,
    });
  };

  const stopDrag = () => {
    setDragging(false);
    dragRef.current = null;
    window.removeEventListener('mousemove', onDrag as any);
    window.removeEventListener('mouseup', stopDrag as any);
  };

  const keyEventMessage = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === 'Escape') {
      onCancel();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setEditedText((prev: any) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSave = () => {
    if (isNew) {
      dispatch(
        createMessage({
          messageText: editedText,
          actor: selectedActor,
          respId: respMessageId,
          messageNumber: selectedMessageNumber,
          chatId: message.chatId,
        })
      );
    } else {
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
    }

    onCancel();
  };

  const handleDelete = () => {
    dispatch(deleteMessageThunk(message.messageId));
    onCancel();
  };

  useEffect(() => {
    adjustHeight();
  }, [editedText]);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
            <div className="emoji-picker-popup" ref={emojiPickerRef}>
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
