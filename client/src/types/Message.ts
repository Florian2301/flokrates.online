import { Actor } from './ActorStyles';

export interface Message {
  messageId: number;
  messageNumber: number;
  chatId: number;
  respId: number | null;
  actor: Actor;
  messageText: string;
}
