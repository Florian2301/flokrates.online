import './ChatBox.css';

import React, { useEffect, useState } from 'react';

import { ChatMessage } from '../message/ChatMessage';
import { Message as MessageType } from '../../types/Message';
import { useParams } from 'react-router-dom';

const API_BASE_URL = process.env.VITE_API_BASE_URL;

export const ChatBox: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    fetch(`${API_BASE_URL}/api/messages/chat/${chatId}`)
      .then((res) => res.json())
      .then((data: MessageType[]) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Messages:', err);
        setLoading(false);
      });
  }, [chatId]);

  if (loading) return <div>Lade...</div>;

  return (
    <div className="chatbox-main">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.messageId}
          messageId={msg.messageId}
          respId={msg.respId}
          chatId={msg.chatId}
          messageNumber={msg.messageNumber}
          actor={msg.actor}
          messageText={msg.messageText}
        ></ChatMessage>
      ))}
    </div>
  );
};

export default ChatBox;
