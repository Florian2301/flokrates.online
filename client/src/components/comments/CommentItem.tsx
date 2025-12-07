import './CommentItem.css';

import { PencilLine, Save, Trash2, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { deleteCommentThunk, patchComment } from '../../store/commentsSlice';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '../../store/store';
import { Comment } from '../../types/Comment';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { selectIsAuthenticated } from '../../store/authSlice';

type Props = {
  comment: Comment;
  isEditing: boolean;
  activeEditId: number | null;
  setActiveEditId: React.Dispatch<React.SetStateAction<number | null>>;
};

const CommentItem: React.FC<Props> = ({
  comment,
  isEditing,
  activeEditId,
  setActiveEditId,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [edit, setEdit] = useState(isEditing);
  const [sender, setSender] = useState(comment.sender);
  const [text, setText] = useState(comment.commentText);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAuth = useSelector(selectIsAuthenticated);
  const created = useMemo(() => {
    const d = new Date(comment.dateCreated);
    if (Number.isNaN(d.getTime())) return comment.dateCreated;

    return d.toLocaleString('de-DE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }, [comment.dateCreated]);

  useEffect(() => {
    setEdit(isEditing);
  }, [isEditing]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  useEffect(() => {
    if (edit) adjustHeight();
  }, [edit, text]);

  // globales Save-Event
  useEffect(() => {
    function handleSaveEvent(e: CustomEvent<{ id: number }>) {
      if (e.detail.id === comment.commentId && edit) {
        handleSave();
      }
    }
    window.addEventListener('save-comment', handleSaveEvent as EventListener);
    return () => {
      window.removeEventListener(
        'save-comment',
        handleSaveEvent as EventListener
      );
    };
  }, [edit, text, sender]);

  const handleSave = async () => {
    await dispatch(
      patchComment({
        commentId: comment.commentId,
        updates: { sender, commentText: text },
      })
    ).unwrap();
    setShowEmojiPicker(false);
    setEdit(false);
    setActiveEditId(null);
  };

  const handleDelete = async () => {
    const ok = window.confirm('Delete this comment?');
    if (!ok) return;
    await dispatch(
      deleteCommentThunk({
        commentId: comment.commentId,
        chatId: comment.chatId,
      })
    ).unwrap();
  };

  const keyHandler: React.KeyboardEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (e) => {
    if (e.key === 'Escape') {
      setShowEmojiPicker(false);
      setEdit(false);
      setActiveEditId(null);
      setSender(comment.sender);
      setText(comment.commentText);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const alignmentClass = comment.admin
    ? 'comment-align-right'
    : 'comment-align-left';

  return (
    <div className={`comment-item-wrapper ${alignmentClass}`}>
      <div
        className={`comment-container ${edit ? 'comment-edit' : 'comment-save'}`}
      >
        <div className="comment-header">
          <div className="comment-header-block">
            {edit ? (
              <input
                className="comment-sender-input"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                onKeyDown={keyHandler}
                maxLength={25}
                placeholder="Name"
              />
            ) : (
              <span className="comment-sender comment-sender-strong">
                {comment.sender}
                {comment.admin && (
                  <span className="comment-admin-badge">(Admin)</span>
                )}
              </span>
            )}
          </div>

          <div className="comment-header-block">
            {edit && isAuth && (
              <button
                className="comment-emoji-btn"
                type="button"
                onClick={() => setShowEmojiPicker((p) => !p)}
                title="Emoji"
              >
                😊
              </button>
            )}
            {showEmojiPicker && (
              <div className="comment-emoji-picker">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  previewPosition="none"
                  skinTonePosition="none"
                  theme="light"
                  sheetSize={32}
                />
              </div>
            )}

            {isAuth && (
              <span
                className="comment-button-edit"
                title={edit ? 'Save' : 'Edit'}
                onClick={() => {
                  if (edit) {
                    handleSave();
                  } else {
                    if (activeEditId && activeEditId !== comment.commentId) {
                      const ev = new CustomEvent('save-comment', {
                        detail: { id: activeEditId },
                      });
                      window.dispatchEvent(ev);
                    }
                    setActiveEditId(comment.commentId);
                    setEdit(true);
                  }
                }}
              >
                {edit ? (
                  <Save size={18} strokeWidth={1.5} />
                ) : (
                  <PencilLine size={18} strokeWidth={1.5} />
                )}
              </span>
            )}

            {edit && isAuth && (
              <span
                className="comment-button-edit"
                title="Cancel"
                onClick={() => {
                  setSender(comment.sender);
                  setText(comment.commentText);
                  setEdit(false);
                  setActiveEditId(null);
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </span>
            )}
            {isAuth && (
              <span
                className="comment-button-edit"
                title="Delete"
                onClick={handleDelete}
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </span>
            )}

            <span className="comment-date">{created}</span>
          </div>
        </div>

        <div className="comment-body">
          {edit ? (
            <textarea
              className="comment-textarea"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onInput={adjustHeight}
              onKeyDown={keyHandler}
              rows={3}
            />
          ) : (
            <div className="comment-display">{comment.commentText}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
