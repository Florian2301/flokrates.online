export interface Comment {
  commentId: number;
  chatId: number;
  sender: string;
  commentText: string;
  dateCreated: string;
  dateModified: string | null;
  admin?: boolean;
}

export type NewCommentPayload = Pick<
  Comment,
  'chatId' | 'sender' | 'commentText'
>;
