import './ChatInfo.css';

import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMessagesForChat } from '../../store/chatsSclice';
import { languageMap } from '../../constants/language';

const ChatInfo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );
  const messages = useSelector(
    (state: RootState) => state.messages.selectedmessages
  );

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessagesForChat(selectedChat.chatId));
    }
  }, [selectedChat, dispatch]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE');
  };

  if (!selectedChat) return <div>Lade Chat...</div>;

  return (
    <div>
      <div className="chatinfo">
        <p className="chatpara">Chatnumber:</p>
        <p className="chatpara">{selectedChat.chatNumber}</p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Title:</p>
        <p className="chatpara">{selectedChat.title}</p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Description:</p>
        <p className="chatpara">{selectedChat.description}</p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Tags:</p>
        <p className="chatpara">{selectedChat.tags}</p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Messages:</p>
        <p className="chatpara">{messages.length}</p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Language:</p>
        <p className="chatpara">
          {selectedChat.language
            ? languageMap[selectedChat.language] || selectedChat.language
            : ''}
        </p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Published:</p>
        <p className="chatpara">
          {selectedChat.datePublished
            ? formatDate(selectedChat.datePublished)
            : ''}
        </p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Download:</p>
        <a className="chatpara">Link</a>
      </div>
    </div>
  );
};

export default ChatInfo;
