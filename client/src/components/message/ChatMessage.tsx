import './ChatMessage.css';

import React, { useEffect, useRef, useState } from 'react';
import { patchMessage, updateMessage } from '../../store/messagesSlice';

import { AppDispatch } from '../../store/store';
import { Message } from '../../types/Message';
import NewMessage from './NewMessage';
import Picker from '@emoji-mart/react';
import { RootState } from '../../store/store';
import { actorStyles } from '../../types/ActorStyles';
import data from '@emoji-mart/data';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

type ChatMessageProps = {
  message: Message;
  isEditing: boolean;
  activeEditId: number | null;
  setActiveEditId: React.Dispatch<React.SetStateAction<number | null>>;
  previewMode?: boolean;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isEditing,
  activeEditId,
  setActiveEditId,
  previewMode = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { messageId, messageText, actor, messageNumber, respId } = message;

  const { colorClass, alignClass, actorName } =
    actorStyles[actor as keyof typeof actorStyles];

  const [edit, setEdit] = useState(isEditing);
  const [editedText, setEditedText] = useState(messageText);
  const [fullEdit, setFullEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesInChat = useSelector((state: RootState) =>
    state.messages.chatmessages.filter((m) => m.chatId === message.chatId)
  );
  const responseMessage = respId
    ? messagesInChat.find((m) => m.messageId === respId)
    : null;
  const [showResponsePopup, setShowResponsePopup] = useState(false);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const keyEventMessage = (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (event.code === 'Escape') {
      setEdit(false);
      setActiveEditId(null);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setEditedText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    setFullEdit(false);
  };

  const handleSaveEdit = () => {
    dispatch(
      patchMessage({
        messageId,
        updates: {
          messageText: editedText,
        },
      })
    );
    setEdit(false);
    setActiveEditId(null);
  };

  useEffect(() => {
    if (edit) adjustHeight();
  }, [edit, editedText]);

  useEffect(() => {
    function handleSaveEvent(e: CustomEvent<{ id: number }>) {
      if (e.detail.id === messageId && edit) {
        handleSaveEdit();
      }
    }
    window.addEventListener('save-message', handleSaveEvent as EventListener);
    return () => {
      window.removeEventListener(
        'save-message',
        handleSaveEvent as EventListener
      );
    };
  }, [edit, editedText]);

  const handleJumpToMessage = () => {
    if (!messageId) return;

    const target = document.getElementById(`message-${messageId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('message-highlight');
      setTimeout(() => target.classList.remove('message-highlight'), 2000);
    }
    setShowResponsePopup(false);
  };

  return (
    <div
      className={`message-wrapper ${alignClass}`}
      id={`message-${messageId}`}
    >
      {showResponsePopup && responseMessage && (
        <div className="response-popup">
          <ChatMessage
            message={responseMessage}
            isEditing={false}
            activeEditId={null}
            setActiveEditId={() => {}}
            previewMode={true}
          />
        </div>
      )}
      <div
        className={`message-container ${edit ? 'edit' : 'save'}`}
        id={`${previewMode ? 'message-container-preview' : undefined}`}
      >
        {respId && responseMessage && (
          <div className="response-info">
            <span>
              <button
                className="response-link"
                onClick={() => setShowResponsePopup((prev) => !prev)}
              >
                {`${
                  showResponsePopup
                    ? 'Close preview'
                    : 'Response to #' + responseMessage.messageNumber
                }`}
              </button>
            </span>
          </div>
        )}

        <div className="message-header">
          <div className="message-header-block">
            <span id="message-span"># {messageNumber}</span>
            <span className={colorClass}>{actorName}</span>
          </div>
          <div className="message-header-block">
            {edit && (
              <div className="emoji-section">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  😊
                </button>
                {showEmojiPicker && (
                  <div
                    className="emoji-picker-popup"
                    id="empoji-picker-pop-chatmessage"
                  >
                    <Picker
                      date={data}
                      onEmojiSelect={handleEmojiSelect}
                      previewPosition="none"
                      skinTonePosition="none"
                      theme="light"
                      sheetSize={32}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {!previewMode ? (
            <div className="message-header-block">
              <span
                className="message-button-edit"
                onClick={() => {
                  if (edit) {
                    handleSaveEdit();
                    setEdit(false);
                  } else {
                    if (activeEditId && activeEditId !== messageId) {
                      const event = new CustomEvent('save-message', {
                        detail: { id: activeEditId },
                      });
                      window.dispatchEvent(event);
                    }
                    setActiveEditId(messageId);
                    setEdit(true);
                  }
                }}
              >
                {edit ? 'Save' : 'Edit'}
              </span>
              <span
                className="message-button-edit"
                onClick={() => {
                  if (fullEdit) {
                    const event = new CustomEvent('save-message', {
                      detail: { id: messageId },
                    });
                    window.dispatchEvent(event);
                    setFullEdit(false);
                  } else {
                    if (activeEditId && activeEditId !== messageId) {
                      const event = new CustomEvent('save-message', {
                        detail: { id: activeEditId },
                      });
                      window.dispatchEvent(event);
                    }
                    setActiveEditId(messageId);
                    setFullEdit(true);
                  }
                }}
              >
                Fulledit
              </span>
            </div>
          ) : (
            <div className="message-header-block">
              <span
                className="message-button-edit"
                onClick={handleJumpToMessage}
              >
                jump to
              </span>
            </div>
          )}
        </div>
        <div className="message-body">
          {edit ? (
            <textarea
              id="message-textarea"
              value={editedText}
              ref={textareaRef}
              onKeyDown={keyEventMessage}
              onChange={(e) => setEditedText(e.target.value)}
              onInput={adjustHeight}
            />
          ) : (
            <div id="message-display">{messageText}</div>
          )}
        </div>
      </div>

      {fullEdit && (
        <NewMessage
          messageId={messageId}
          isNew={false}
          onCancel={() => setFullEdit(false)}
        />
      )}
    </div>
  );
};

export default ChatMessage;
