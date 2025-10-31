export interface Comment {
  commentId: number;
  chatId: number;
  sender: string; // oder number, falls du später auf AuthorId verlinkst
  commentText: string;
  dateCreated: string;
  dateModified: string | null;
}
