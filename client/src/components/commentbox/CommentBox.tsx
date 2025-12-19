import './CommentBox.css';

import type { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useState } from 'react';
import {
  fetchCommentsForChat,
  selectCommentsForChat,
} from '../../store/commentsSlice';
import { useDispatch, useSelector } from 'react-redux';

import CommentItem from '../comments/CommentItem';
import NewComment from '../comments/NewComment';

const CommentBox: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector((s: RootState) => s.chats.selectedChat);
  const chatId = selectedChat?.chatId ?? null;
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const comments = useSelector((s: RootState) =>
    chatId ? selectCommentsForChat(s, chatId) : []
  );

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

  return (
    <div className="commentbox-main fade-in">
      {comments.map((c) => (
        <CommentItem
          key={c.commentId}
          comment={c}
          isEditing={activeEditId === c.commentId}
          activeEditId={activeEditId}
          setActiveEditId={setActiveEditId}
        />
      ))}

      {showNew && (
        <NewComment
          onCancel={() => {
            setShowNew(false);
            setActiveEditId(null);
          }}
        />
      )}

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
