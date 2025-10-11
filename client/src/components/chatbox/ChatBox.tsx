import './ChatBox.css';

import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Actor } from '../../types/ActorStyles';
import { ChatMessage } from '../message/ChatMessage';
import NewMessage from '../message/NewMessage';
import { createMessage } from '../../store/messagesSlice';
import { fetchMessagesForChat } from '../../store/chatsSclice';

export const ChatBox: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(
    (state: RootState) => state.messages.chatmessages
  );
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );
  const [newMessageId, setNewMessageId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessagesForChat(selectedChat.chatId));
    }
  }, [selectedChat, dispatch]);

  const handleNewMessageClick = async () => {
    if (!selectedChat) return;

    if (activeEditId) {
      const event = new CustomEvent('save-message', {
        detail: { id: activeEditId },
      });
      window.dispatchEvent(event);
      setActiveEditId(null);
    }

    const tempId = Date.now(); // temporäre ID für NewMessage
    setNewMessageId(tempId);
    setActiveEditId(tempId);

    /*const newMsg = {
      messageText: '',
      actor: 'FLO' as Actor,
      messageNumber: messages.length + 1,
      respId: null,
      chatId: selectedChat.chatId,
    };
    try {
      const result = await dispatch(createMessage(newMsg));

      if (createMessage.fulfilled.match(result)) {
        const createdMessageId = result.payload.messageId;
        setNewMessageId(createdMessageId);
        setActiveEditId(createdMessageId);
      } else {
        console.error('Fehler beim Erstellen der Nachricht:', result.payload);
      }
    } catch (err) {
      console.error(err);
    }*/
  };

  if (!selectedChat) {
    return <div>Bitte wähle zuerst einen Chat aus.</div>;
  }

  if (!messages || messages.length === 0) {
    return <div>Lade Nachrichten...</div>;
  }

  return (
    <div className="chatbox-main">
      {messages
        .slice()
        .sort((a, b) => a.messageNumber - b.messageNumber)
        .map((msg) => {
          return (
            <ChatMessage
              key={msg.messageId}
              message={msg}
              isEditing={activeEditId === msg.messageId}
              activeEditId={activeEditId}
              setActiveEditId={setActiveEditId}
            />
          );
        })}

      <div className="chatbox-header">
        <button className="new-message-button" onClick={handleNewMessageClick}>
          +
        </button>
      </div>

      {newMessageId && (
        <NewMessage
          messageId={newMessageId}
          isNew={true}
          onCancel={() => {
            setNewMessageId(null);
            setActiveEditId(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatBox;
