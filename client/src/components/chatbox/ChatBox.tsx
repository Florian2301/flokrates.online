import './ChatBox.css';

import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChatMessage } from '../message/ChatMessage';
import { fetchMessagesForChat } from '../../store/chatsSclice';

export const ChatBox: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((s: RootState) => s.messages.selectedmessages);
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const selectedChat = useSelector((s: RootState) => s.chats.selectedChat);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessagesForChat(selectedChat.chatId));
    }
  }, [selectedChat, dispatch]);

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
              setActiveEditId={setActiveEditId}
            />
          );
        })}
    </div>
  );
};

export default ChatBox;
