import './ChatList.css';

import { useEffect, useState } from 'react';

import { Chat } from '../../types/Chats';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  chats: Chat[];
};

export const ChatListTable: React.FC<Props> = ({ chats }) => {
  const navigate = useNavigate();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE');
  };

  const handleClick = (chatId: number) => {
    navigate(`/chatbox/${chatId}`);
  };

  return (
    <div className="table-chats">
      <div className="table-rows-head">
        <div className="thead" id="thead-number">
          #
        </div>
        <div className="thead">Title</div>
        <div className="thead">Date</div>
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
            key={uuidv4()}
            className="table-rows-data"
            onClick={() => handleClick(chat.chatId)}
          >
            <div className="table-columns" id="table-columns-number">
              {chat.chatNumber}
            </div>
            <div className="table-columns">{chat.title}</div>
            <div className="table-columns">
              {formatDate(chat.datePublished)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
