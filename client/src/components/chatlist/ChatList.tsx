import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect } from 'react';
import {
  fetchChats,
  fetchChatsWithCounts,
  selectChatsLoaded,
  selectPublishedChatsByLanguage,
} from '../../store/chatsSclice';
import { useDispatch, useSelector } from 'react-redux';

import { ChatListTable } from './ChatListTable';
import { selectLanguage } from '../../store/languageSlice';

export const ChatList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const lang = useSelector(selectLanguage);
  const allChats = useSelector((state: RootState) => state.chats.chats);
  const loading = useSelector((state: RootState) => state.chats.loading);
  const error = useSelector((state: RootState) => state.chats.error);
  const chatsLoaded = useSelector(selectChatsLoaded);
  const publishedChats = useSelector((state: RootState) =>
    selectPublishedChatsByLanguage(state, lang)
  );

  useEffect(() => {
    if (!chatsLoaded) {
      dispatch(fetchChatsWithCounts());
    }
  }, [chatsLoaded, dispatch]);
  if (loading) console.log('Lade Chats...');
  if (error) console.log('Fehler beim Laden:', error);

  return (
    <div className="chat-overview">
      <ChatListTable chats={publishedChats} />
    </div>
  );
};

export default ChatList;
