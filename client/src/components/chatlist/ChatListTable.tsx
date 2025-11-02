import './ChatList.css';

import { FileText, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { AppDispatch } from '../../store/store';
import { Chat } from '../../types/Chats';
import { fetchMessagesForChat } from '../../store/messagesSlice';
import { setSelectedChat } from '../../store/chatsSclice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

type Props = {
  chats: Chat[];
};

export const ChatListTable: React.FC<Props> = ({ chats }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const handleClick = (chat: Chat) => {
    dispatch(setSelectedChat(chat));
    dispatch(fetchMessagesForChat(chat.chatId));
    navigate(`/chatbox`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.chat-info-popup') &&
        !target.closest('.chat-date')
      ) {
        setActiveChatId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="table-chats">
      <div className="table-rows-head">
        <div className="thead" id="thead-number">
          #
        </div>
        <div className="thead">Title</div>
        <div className="thead"></div>
        <div className="thead"></div>
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
            onClick={(e) => {
              activeChatId === chat.chatId
                ? (e.stopPropagation(), setActiveChatId(null))
                : handleClick(chat);
            }}
          >
            <div className="table-columns" id="table-columns-number">
              {chat.chatNumber}
            </div>
            <div className="table-columns">{chat.title}</div>
            <div
              className="table-columns"
              title="Quick Info"
              onClick={(e) => {
                e.stopPropagation();
                setActiveChatId(
                  activeChatId === chat.chatId ? null : chat.chatId
                );
              }}
            >
              <Info size={18} strokeWidth={1.5} />
            </div>
            <div
              className="table-columns"
              title="PDF Download"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FileText size={18} strokeWidth={1.5} />
            </div>
            <div></div>
            {activeChatId === chat.chatId && (
              <div
                className="chat-info-popup"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveChatId(null);
                }}
              >
                <div className="popup-body">
                  <p className="popup-body">{chat.tags}</p>
                  <hr className="chatlist-divider" />

                  <p className="popup-body">
                    {chat.description || 'Keine Beschreibung'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
