import React, { useEffect, useState } from 'react';

import { Chat } from '../../types/Chats';
import { ChatListTable } from './ChatListTable';

const API_BASE_URL = process.env.VITE_API_BASE_URL;

export const ChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/chats`)
      .then((res) => res.json())
      .then((data: Chat[]) => {
        setChats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Chats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Lade Chats...</div>;

  return (
    <div className="chat-overview">
      <ChatListTable chats={chats} />
    </div>
  );
};

export default ChatList;
