import { Actor } from './ActorStyles';

export interface Message {
  messageId: number;
  messageNumber: number;
  chatId: number;
  respId: number;
  actor: Actor;
  messageText: string;
}
