import './ChatMessage.css';

import React, { useEffect, useRef, useState } from 'react';

import { AppDispatch } from '../../store/store';
import { Message } from '../../types/Message';
import NewMessage from './NewMessage';
import Picker from '@emoji-mart/react';
import { actorStyles } from '../../types/ActorStyles';
import { changeMessage } from '../../store/messagesSlice';
import data from '@emoji-mart/data';
import { useDispatch } from 'react-redux';

type ChatMessageProps = {
  message: Message;
  isEditing: boolean;
  setActiveEditId: React.Dispatch<React.SetStateAction<number | null>>;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isEditing,
  setActiveEditId,
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

  useEffect(() => {
    if (edit) adjustHeight();
  }, [edit, editedText]);

  function adjustHeight() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }

  function keyEventMessage(
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) {
    if (event.code === 'Escape') {
      setEdit(false);
      setActiveEditId(null);
    }
  }

  function handleEmojiSelect(emoji: any) {
    setEditedText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    setFullEdit(false);
  }

  function handleSaveEdit() {
    dispatch(
      changeMessage({
        messageId,
        updatedText: editedText,
        newActor: actor,
        newMessageNumber: messageNumber,
        oldMessageNumber: messageNumber,
        responseId: respId,
      })
    );
    setEdit(false);
    setActiveEditId(null);
  }

  return (
    <div className={`message-wrapper ${alignClass}`}>
      <div className={`message-container ${edit ? 'edit' : 'save'}`}>
        <div className="message-header">
          <span className={colorClass}>{actorName}</span>
          <span
            className="message-button-edit"
            onClick={() => {
              if (edit) {
                handleSaveEdit();
                setEdit(false);
              } else {
                setActiveEditId(messageId);
                setEdit(true);
              }
            }}
          >
            {edit ? 'Save' : 'Edit'}
          </span>

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

          <span
            className="message-button-edit"
            onClick={() => setFullEdit(true)}
          >
            Full
          </span>
          <span className="message-number"># {messageNumber}</span>
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
            <div>{messageText}</div>
          )}
        </div>
      </div>

      {fullEdit && (
        <NewMessage
          messageId={message.messageId}
          onCancel={() => setFullEdit(false)}
        />
      )}
    </div>
  );
};

export default ChatMessage;
