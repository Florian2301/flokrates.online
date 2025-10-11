import './ChatBox.css';

import { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useState } from 'react';
import {
  deleteMessageThunk,
  fetchMessages,
  saveAllMessages,
  saveSingleMessage,
  setMessages,
  updateMessage,
} from '../../store/messagesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { Actor } from '../../types/ActorStyles';
import { ChatMessage } from '../message/ChatMessage';
import { Message } from '../../types/Message';
import { fetchMessagesForChat } from '../../store/chatsSclice';

export const ChatBox: React.FC = () => {
  //const { messages, setMessages } = useChatContext();
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((s: RootState) => s.messages.items);
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const selectedChat = useSelector((s: RootState) => s.chats.selectedChat);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessagesForChat(selectedChat.chatId));
    }
  }, [selectedChat, dispatch]);

  if (!selectedChat) {
    return <div>Bitte wähle zuerst einen Chat aus.</div>;
  }

  if (!messages || messages.length === 0) {
    return <div>Lade Nachrichten...</div>;
  }

  /*const handleMessagesChanged = (
    messageId: number,
    updatedText: string,
    newActor: Actor,
    newMessageNumber: number,
    oldMessageNumber: number,
    responseId: number | null
  ) => {
    let messagesChanged: boolean = false;

    const updatedMessages = messages.map((msg) => {
      if (msg.messageId === messageId) {
        const messageChanged =
          msg.messageText !== updatedText ||
          msg.actor !== newActor ||
          msg.respId !== responseId ||
          msg.messageNumber != newMessageNumber;

        if (messageChanged) {
          messagesChanged = messageChanged;
          return {
            ...msg,
            messageText:
              msg.messageText !== updatedText ? updatedText : msg.messageText,
            actor: msg.actor !== newActor ? newActor : msg.actor,
            respId: msg.respId != responseId ? responseId : msg.respId,
          };
        }
      }
      return msg;
    });

    if (!messagesChanged) return;

    if (oldMessageNumber != newMessageNumber) {
      sortMessages(
        messageId,
        updatedMessages,
        newMessageNumber,
        oldMessageNumber
      );
    } else {
      dispatch(setMessages(updatedMessages));
      dispatch(
        saveSingleMessage({
          messageId,
          messageNumber: oldMessageNumber,
          respId: responseId,
          actor: newActor,
          messageText: updatedText,
        })
      );
    }
  };

  function sortMessages(
    messageId: number,
    messages: Message[],
    newMessageNumber: number,
    oldMessageNumber: number
  ) {
    const updatedMessages = messages
      .map((msg) => {
        if (oldMessageNumber > newMessageNumber) {
          if (
            msg.messageNumber >= newMessageNumber &&
            msg.messageNumber < oldMessageNumber
          ) {
            return { ...msg, messageNumber: msg.messageNumber + 1 };
          }
        }

        if (oldMessageNumber < newMessageNumber) {
          if (
            msg.messageNumber <= newMessageNumber &&
            msg.messageNumber > oldMessageNumber
          ) {
            return { ...msg, messageNumber: msg.messageNumber - 1 };
          }
        }

        return msg;
      })
      .map((msg) =>
        msg.messageId === messageId
          ? { ...msg, messageNumber: newMessageNumber }
          : msg
      );

    const sorted = [...updatedMessages].sort(
      (a, b) => a.messageNumber - b.messageNumber
    );
    dispatch(saveAllMessages(sorted));
    dispatch(setMessages(sorted));
  }

  function deleteMessage(id: number) {
    const updated = messages
      .filter((msg) => msg.messageId !== id)
      .map((msg, index) => ({
        ...msg,
        messageNumber: index + 1,
      }));

    dispatch(deleteMessageThunk(id));
    dispatch(saveAllMessages(updated));
    dispatch(setMessages(updated));
  }*/

  return (
    <div className="chatbox-main">
      {messages
        .slice()
        .sort((a, b) => a.messageNumber - b.messageNumber)
        .map((msg) => {
          return (
            <ChatMessage
              key={msg.messageId}
              message={msg}
              isEditing={activeEditId === msg.messageId}
              setActiveEditId={setActiveEditId}
            />
          );
        })}
    </div>
  );
};

export default ChatBox;
