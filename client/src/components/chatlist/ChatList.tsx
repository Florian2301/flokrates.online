import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChatListTable } from './ChatListTable';
import { fetchChats } from '../../store/chatsSclice';

export const ChatList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    chats: chats,
    loading,
    error,
  } = useSelector((state: RootState) => state.chats);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  if (loading) return <div>Lade Chats...</div>;
  if (error) return <div>Fehler beim Laden: {error}</div>;

  return (
    <div className="chat-overview">
      <ChatListTable chats={chats} />
    </div>
  );
};

export default ChatList;
