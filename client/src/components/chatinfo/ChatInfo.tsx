import './ChatInfo.css';

import React, { useEffect } from 'react';

import { Chat } from '../../types/Chats';
import { languageMap } from '../../constants/language';
import { useChatContext } from '../../context/ChatContext';

const ChatInfo: React.FC = () => {
  const { selectedChat, setSelectedChat, messageCount } = useChatContext();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE');
  };

  useEffect(() => {
    const storedChat = localStorage.getItem('selectedChat');
    if (storedChat) {
      try {
        const parsedChat: Chat = JSON.parse(storedChat);
        setSelectedChat(parsedChat);
      } catch (e) {
        console.error('Fehler beim Parsen des gespeicherten Chats:', e);
      }
    }
  }, []);

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
        <p className="chatpara">{messageCount}</p>
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
