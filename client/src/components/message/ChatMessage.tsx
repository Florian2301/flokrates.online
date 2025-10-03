import './ChatMessage.css';

import { Actor, actorStyles } from '../../types/ActorStyles';
import React, { useEffect, useRef, useState } from 'react';

import { Message } from '../../types/Message';
import NewMessage from './NewMessage';
import { useChatContext } from '../../context/ChatContext';

type ChatMessageProps = {
  messageId: number;
  respId: number | null;
  chatId: number;
  messageNumber: number;
  actor: Actor;
  messageText: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isEditing: boolean;
  setActiveEditId: React.Dispatch<React.SetStateAction<number | null>>;
  onMessagesChanged: (
    messageId: number,
    updatedMsg: string,
    newActor: Actor,
    newMessageNumber: number,
    oldMessageNumber: number,
    respId: number | null
  ) => void;
  deleteMessage: (messageId: number) => void;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  messageId,
  respId,
  chatId,
  messageNumber,
  actor,
  messageText,
  setMessages,
  isEditing,
  setActiveEditId,
  onMessagesChanged,
  deleteMessage,
}) => {
  const { messageCount } = useChatContext();

  const { colorClass, alignClass, actorName } =
    actorStyles[actor as keyof typeof actorStyles];

  const [edit, setEdit] = useState(isEditing);
  const [editedText, setEditedText] = useState(messageText);
  const [fullEdit, setFullEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className={`message-wrapper ${alignClass}`}>
      <div className={`message-container ${edit ? 'edit' : 'save'}`}>
        <div className="message-header">
          <span className={colorClass}>{actorName}</span>
          <span
            className="message-button-edit"
            onClick={() => {
              if (edit) {
                onMessagesChanged(
                  messageId,
                  editedText,
                  actor,
                  messageNumber,
                  messageNumber,
                  respId
                );
                setEdit(false);
              } else {
                setActiveEditId(messageId);
                setEdit(true);
              }
            }}
          >
            {edit ? 'Save' : 'Edit'}
          </span>
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
          messageId={messageId}
          initialText={messageText}
          initialActor={actor}
          initialMessageNumber={messageNumber}
          maxMessageNumber={messageCount}
          respId={respId}
          onSave={(
            messageId,
            newText,
            newActor,
            newMessageNumber,
            oldMessageNumber,
            respId
          ) => {
            onMessagesChanged(
              messageId,
              newText,
              newActor,
              newMessageNumber,
              oldMessageNumber,
              respId
            );
            setFullEdit(false);
          }}
          onCancel={() => setFullEdit(false)}
          onDelete={() => {
            deleteMessage(messageId);
            setFullEdit(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatMessage;
