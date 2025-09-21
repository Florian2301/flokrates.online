import './ChatBox.css';

import React, { useState } from 'react';

import { Actor } from '../../types/ActorStyles';
import { ChatMessage } from '../message/ChatMessage';
import { Message } from '../../types/Message';
import { useChatContext } from '../../context/ChatContext';

export const ChatBox: React.FC = () => {
  const { messages, setMessages } = useChatContext();
  const [activeEditId, setActiveEditId] = useState<number | null>(null);

  const handleMessagesChanged = (
    messageId: number,
    updatedText: string,
    newActor: Actor,
    newMessageNumber: number,
    oldMessageNumber: number,
    responseId: number
  ) => {
    let updatedMessages = messages.map((msg) => {
      if (msg.messageId === messageId) {
        return {
          ...msg,
          messageText:
            msg.messageText !== updatedText ? updatedText : msg.messageText,
          actor: msg.actor !== newActor ? newActor : msg.actor,
        };
      }
      return msg;
    });

    if (oldMessageNumber !== newMessageNumber) {
      sortMessages(
        messageId,
        updatedMessages,
        newMessageNumber,
        oldMessageNumber
      );
    } else {
      saveSingleMessage(
        messageId,
        oldMessageNumber,
        responseId,
        newActor,
        updatedText
      );
      setMessages(
        [...updatedMessages].sort((a, b) => a.messageNumber - b.messageNumber)
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
    saveAllMessages(sorted);
    setMessages(sorted);
  }

  function saveAllMessages(updatedMessages: Message[]) {
    updatedMessages.forEach((msg) => {
      fetch(`${process.env.API_BASE_URL}/api/messages/${msg.messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageNumber: msg.messageNumber,
          respId: msg.respId,
          actor: msg.actor,
          messageText: msg.messageText,
        }),
      });
    });
  }

  function saveSingleMessage(
    messageId: number,
    messageNumber: number,
    respId: number,
    actor: Actor,
    messageText: string
  ) {
    fetch(`${process.env.API_BASE_URL}/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageNumber: messageNumber,
        respId: respId,
        actor: actor,
        messageText: messageText,
      }),
    });
  }

  if (!messages || messages.length === 0) return <div>Lade...</div>;

  return (
    <div className="chatbox-main">
      {messages
        .slice()
        .sort((a, b) => a.messageNumber - b.messageNumber)
        .map((msg) => {
          return (
            <ChatMessage
              key={msg.messageId}
              messageId={msg.messageId}
              respId={msg.respId}
              chatId={msg.chatId}
              messageNumber={msg.messageNumber}
              actor={msg.actor}
              messageText={msg.messageText}
              setMessages={setMessages}
              isEditing={activeEditId === msg.messageId}
              setActiveEditId={setActiveEditId}
              onMessagesChanged={(
                messageId: number,
                updatedText: string,
                newActor: Actor,
                newMessageNumber: number,
                oldMessageNumber: number,
                responseId: number
              ) =>
                handleMessagesChanged(
                  messageId,
                  updatedText,
                  newActor,
                  newMessageNumber,
                  oldMessageNumber,
                  responseId
                )
              }
            />
          );
        })}
    </div>
  );
};

export default ChatBox;
