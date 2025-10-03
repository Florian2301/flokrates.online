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
      setMessages(updatedMessages);
      saveSingleMessage(
        messageId,
        oldMessageNumber,
        responseId,
        newActor,
        updatedText
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
    respId: number | null,
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

  function deleteMessage(id: number) {
    const updated = messages
      .filter((msg) => msg.messageId !== id)
      .map((msg, index) => ({
        ...msg,
        messageNumber: index + 1,
      }));

    fetch(`${process.env.API_BASE_URL}/api/messages/${id}`, {
      method: 'DELETE',
    });

    setMessages(updated);
    saveAllMessages(updated);
    localStorage.setItem('messages', JSON.stringify(updated));
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
              respId={msg.respId ?? null}
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
                respId: number | null
              ) =>
                handleMessagesChanged(
                  messageId,
                  updatedText,
                  newActor,
                  newMessageNumber,
                  oldMessageNumber,
                  respId
                )
              }
              deleteMessage={(messageId: number) => deleteMessage(messageId)}
            />
          );
        })}
    </div>
  );
};

export default ChatBox;
