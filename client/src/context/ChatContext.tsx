import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Chat } from '../types/Chats';
import { Message } from '../types/Message';

const API_BASE_URL = process.env.API_BASE_URL;

type ChatContextType = {
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  messageCount: number;
  setMessageCount: (count: number) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const storedChat = localStorage.getItem('selectedChat');
    const storedCount = localStorage.getItem('messageCount');

    if (storedChat) {
      try {
        setSelectedChat(JSON.parse(storedChat));
      } catch (e) {
        console.error('Fehler beim Parsen des gespeicherten Chats:', e);
      }
    }

    if (storedCount) {
      setMessageCount(Number(storedCount));
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem('selectedChat', JSON.stringify(selectedChat));
    }
  }, [selectedChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/messages/chat/${selectedChat.chatId}`
        );
        const data: Message[] = await res.json();

        console.log('chatcontext data', data);

        const mappedMessages = data.map((msg) => ({
          ...msg,
          actor: msg.actor,
        }));

        setMessages(mappedMessages);
        setMessageCount(data.length);

        localStorage.setItem('messages', JSON.stringify(data));
        localStorage.setItem('messageCount', data.length.toString());
      } catch (e) {
        console.error('Fehler beim Laden der Nachrichten:', e);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    const stored = localStorage.getItem('messages');
    if (stored) {
      try {
        const parsed: Message[] = JSON.parse(stored);
        setMessages(parsed);
      } catch (e) {
        console.error('Fehler beim Parsen der gespeicherten Nachrichten:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('messageCount', messageCount.toString());
  }, [messageCount]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        messageCount,
        setMessageCount,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
