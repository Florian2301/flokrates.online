export type Language = 'DEU' | 'ENG';
export type Status = 'PUB' | 'REW' | 'DRA' | 'NOT';

export interface Chat {
  chatId: number;
  chatNumber: number;
  title: string;
  tags: string;
  description: string;
  language: Language;
  status: Status;
  authorId: number;
  datePublished: string;
  dateCreated: string;
  dateModified: string;
}
