import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ChatListTable } from './ChatListTable';
import { fetchChats } from '../../store/chatsSclice';
import { selectLanguage } from '../../store/languageSlice';

export const ChatList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    chats: chats,
    loading,
    error,
  } = useSelector((state: RootState) => state.chats);
  const lang = useSelector(selectLanguage);
  const allChats = useSelector((state: RootState) => state.chats.chats);
  const publishedChats = allChats.filter(
    (c) => c.status === 'PUB' && c.language === lang
  );

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  if (loading) console.log('Lade Chats...');
  if (error) console.log('Fehler beim Laden:', error);

  return (
    <div className="chat-overview">
      <ChatListTable chats={publishedChats} />
    </div>
  );
};

export default ChatList;
