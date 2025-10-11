import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Chat } from '../../types/Chats';
import { ChatListTable } from './ChatListTable';
import { fetchChats } from '../../store/chatsSclice';

const API_BASE_URL = process.env.API_BASE_URL;

export const ChatList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: chats,
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
