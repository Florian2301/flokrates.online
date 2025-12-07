import './ChatBox.css';

import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChatMessage } from '../message/ChatMessage';
import NewMessage from '../message/NewMessage';
import { fetchMessagesForChat } from '../../store/messagesSlice';
import { selectIsAuthenticated } from '../../store/authSlice';

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
  const isAuth = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessagesForChat(selectedChat.chatId));
    }
  }, [selectedChat, dispatch]);

  const handleNewMessageClick = async () => {
    if (!selectedChat && isAuth) return;

    if (activeEditId) {
      const event = new CustomEvent('save-message', {
        detail: { id: activeEditId },
      });
      window.dispatchEvent(event);
      setActiveEditId(null);
    }

    const tempId = Date.now(); // temp ID for NewMessage
    setNewMessageId(tempId);
    setActiveEditId(tempId);
  };

  return (
    <div className="chatbox-main fade-in">
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

      {selectedChat && isAuth ? (
        <div className="chatbox-header">
          <button
            className="new-message-button"
            onClick={handleNewMessageClick}
          >
            +
          </button>
        </div>
      ) : null}

      {newMessageId && isAuth && (
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
