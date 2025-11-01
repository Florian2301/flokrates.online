import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';

import { Chat } from '../../types/Chats';
import { Message } from '../../types/Message';
import React from 'react';
import { fetchMessagesForChat } from '../../store/messagesSlice';
import { setSelectedChat } from '../../store/chatsSclice';

type Props = {
  chats: Chat[];
  messages: Message[];
};

export const DraftListTable: React.FC<Props> = ({ chats, messages }) => {
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
    <div className="table-chats">
      <div className="table-rows-head">
        <div className="thead" id="thead-number">
          #
        </div>
        <div className="thead">Title</div>
        <div className="thead">Status</div>
        <div className="thead">Msg</div>
      </div>
      <div
        className={
          window.innerWidth <= 1000
            ? 'chatlist-scroll-mobile'
            : 'chatlist-scroll'
        }
      >
        {chats.map((chat) => (
          <div
            key={chat.chatId}
            className="table-rows-data"
            onClick={() => handleClick(chat)}
          >
            <div className="table-columns" id="table-columns-number">
              {chat.chatNumber}
            </div>
            <div className="table-columns">{chat.title}</div>
            <div className="table-columns">{chat.status}</div>
            <div className="table-columns">
              {loadingCounts && countsByChatId[chat.chatId] == null
                ? '…'
                : (countsByChatId[chat.chatId] ?? 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
