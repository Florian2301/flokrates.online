import './ChatInfo.css';

import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';

import { Chat } from '../../types/Chats';
import React from 'react';
import { fetchMessagesForChat } from '../../store/messagesSlice';
import { setSelectedChat } from '../../store/chatsSclice';

type Props = {
  chats: Chat[];
};

export const DraftListTable: React.FC<Props> = ({ chats }) => {
  const dispatch = useDispatch<AppDispatch>();
  const countsByChatId = useSelector(
    (s: RootState) => s.chats.messageCountsByChatId
  );
  const loadingCounts = useSelector(
    (s: RootState) => s.chats.messageCountsLoading
  );

  const handleClick = (chat: Chat) => {
    dispatch(setSelectedChat(chat));
    dispatch(fetchMessagesForChat(chat.chatId));
  };

  return (
    <div className="table-drafts">
      <div className="table-drafts-rows-head">
        <div className="thead" id="thead-number">
          #
        </div>
        <div className="thead-drafts">Title</div>
        <div className="thead-drafts">Status</div>
        <div className="thead-drafts">Msg</div>
      </div>

      {chats.map((chat) => (
        <div
          key={chat.chatId}
          className="table-drafts-rows-data fade-in"
          onClick={() => handleClick(chat)}
        >
          <div
            className="table-drafts-columns"
            id="table-drafts-columns-number"
          >
            {chat.chatNumber}
          </div>
          <div className="table-drafts-columns">{chat.title}</div>
          <div className="table-drafts-columns tabel-drafts-display">
            {chat.status}
          </div>
          <div className="table-drafts-columns tabel-drafts-display">
            {loadingCounts && countsByChatId[chat.chatId] == null
              ? '…'
              : (countsByChatId[chat.chatId] ?? 0)}
          </div>
        </div>
      ))}
    </div>
  );
};
