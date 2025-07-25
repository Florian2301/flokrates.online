import './ChatMessage.css';

import { Actor, actorStyles } from '../../types/ActorStyles';

import React from 'react';

type ChatMessageProps = {
  messageId: number;
  respId: number;
  chatId: number;
  messageNumber: number;
  actor: Actor;
  messageText: string;
};

export const ChatMessage = ({
  messageId,
  respId,
  chatId,
  messageNumber,
  actor,
  messageText,
}: ChatMessageProps) => {
  const { colorClass, alignClass, name } = actorStyles[actor];
  return (
    <div className={`message-wrapper ${alignClass}`}>
      <div className="message-container">
        <div className="message-header">
          <span className={colorClass}>{name}</span>
          <span className="message-menu">Button</span>
          <span className="message-number"># {messageNumber}</span>
        </div>
        <div className="message-body">{messageText}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
