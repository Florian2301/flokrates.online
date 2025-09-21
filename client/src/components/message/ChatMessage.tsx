import './ChatMessage.css';

import { Actor, actorStyles } from '../../types/ActorStyles';
import React, { useEffect, useRef, useState } from 'react';

import { Message } from '../../types/Message';
import NewMessage from './NewMessage';
import { useChatContext } from '../../context/ChatContext';

type ChatMessageProps = {
  messageId: number;
  respId: number;
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
    responseId: number
  ) => void;
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
}) => {
  const { messageCount } = useChatContext();
  const API_BASE_URL = process.env.API_BASE_URL;

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

  function deleteMessage(id: number) {
    const key = `messages_${chatId}`;
    const stored = localStorage.getItem(key);
    let updated: Message[] = [];

    if (stored) {
      const parsed: Message[] = JSON.parse(stored);
      updated = parsed.filter((msg) => msg.messageId !== id);
      updated.sort((a, b) => a.messageNumber - b.messageNumber);
      updated = updated.map((msg, index) => ({
        ...msg,
        messageNumber: index + 1,
      }));
      localStorage.setItem(key, JSON.stringify(updated));
      setMessages(updated);
    }

    fetch(`${API_BASE_URL}/api/messages/${id}`, { method: 'DELETE' });
    setFullEdit(false);
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
