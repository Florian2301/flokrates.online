import './CommentBox.css';

import type { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Comment } from '../../types/Comment';
import CommentItem from './CommentItem';
import NewComment from './NewComment';
import { fetchCommentsForChat } from '../../store/commentsSlice';

const CommentBox: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector((s: RootState) => s.chats.selectedChat);
  const chatId = selectedChat?.chatId ?? null;

  const comments: Comment[] = useSelector((s: RootState) =>
    chatId ? (s.comments.byChatId[chatId] ?? []) : []
  );

  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (chatId) dispatch(fetchCommentsForChat(chatId));
  }, [chatId, dispatch]);

  const handleNewCommentClick = () => {
    if (!chatId) return;
    if (activeEditId) {
      const ev = new CustomEvent('save-comment', {
        detail: { id: activeEditId },
      });
      window.dispatchEvent(ev);
      setActiveEditId(null);
    }
    setShowNew(true);
  };

  if (!chatId) {
    return <div className="commentbox-main">Wähle zuerst einen Chat.</div>;
  }

  return (
    <div className="commentbox-main">
      {comments.map((c) => (
        <CommentItem
          key={c.commentId}
          comment={c}
          isEditing={activeEditId === c.commentId}
          activeEditId={activeEditId}
          setActiveEditId={setActiveEditId}
        />
      ))}

      {/* Editor IMMER direkt unter dem letzten Comment */}
      {showNew && (
        <NewComment
          onCancel={() => {
            setShowNew(false);
            setActiveEditId(null);
          }}
        />
      )}

      {/* + Button nur, wenn kein Editor offen ist */}
      {!showNew && (
        <div className="commentbox-header">
          <button
            className="new-comment-button"
            onClick={handleNewCommentClick}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentBox;
