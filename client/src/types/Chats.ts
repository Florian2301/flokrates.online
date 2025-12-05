export type Language = 'DE' | 'EN';
export type Status = 'PUB' | 'REW' | 'DRA' | 'NOT';

export interface Chat {
  chatId: number;
  chatNumber: number | null;
  title: string;
  tags: string | null;
  description: string | null;
  language: Language;
  status: Status;
  referencedChatIds?: number[];
  datePublished: string | null;
  dateCreated: string;
  dateModified: string | null;
}

export const statusMap: Record<Status, string> = {
  PUB: 'Published',
  REW: 'Rework',
  DRA: 'Draft',
  NOT: 'Notes',
};
