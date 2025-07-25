export type Actor = 'FLO' | 'PAB' | 'LOT';

export interface Message {
  messageId: number;
  messageNumber: number;
  chatId: number;
  respId: number;
  actor: Actor;
  messageText: string;
}
