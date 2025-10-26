//import './ChatList.css';

import { AppDispatch } from '../../store/store';
import { Chat } from '../../types/Chats';
import React from 'react';
import { fetchMessagesForChat } from '../../store/messagesSlice';
import { setSelectedChat } from '../../store/chatsSclice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

type Props = {
  chats: Chat[];
};

export const DraftListTable: React.FC<Props> = ({ chats }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = (chat: Chat) => {
    dispatch(setSelectedChat(chat));
    dispatch(fetchMessagesForChat(chat.chatId));
    //navigate(`/chatbox`);
  };

  return (
    <div className="table-chats">
      <div className="table-rows-head">
        <div className="thead" id="thead-number">
          #
        </div>
        <div className="thead">Title</div>
        <div className="thead">Status</div>
      </div>
      <div
        className={
          window.innerWidth <= 1000
            ? 'chatlist-scroll-mobile'
            : 'chatlist-scroll'
        }
      >
        {chats.map((chat: Chat) => (
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
          </div>
        ))}
      </div>
    </div>
  );
};
