import './NewComment.css';

import type { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useRef, useState } from 'react';
import { Save, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import Picker from '@emoji-mart/react';
import { createComment } from '../../store/commentsSlice';
import data from '@emoji-mart/data';

type Props = {
  onCancel: () => void;
};

const NewComment: React.FC<Props> = ({ onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector((s: RootState) => s.chats.selectedChat);
  const chatId = selectedChat?.chatId ?? null;
  const [sender, setSender] = useState('');
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const canSave =
    !!chatId && sender.trim().length > 0 && text.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    await dispatch(
      createComment({
        chatId: chatId!,
        sender: sender.trim(),
        commentText: text.trim(),
      })
    ).unwrap();
    onCancel();
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const keyHandler: React.KeyboardEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (e) => {
    if (e.key === 'Escape') onCancel();
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSave) {
      e.preventDefault();
      onSave();
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker)
      document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  return (
    <div className="new-comment-inline">
      <input
        className="new-comment-sender"
        placeholder="Name"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        onKeyDown={keyHandler}
        maxLength={25}
      />
      <textarea
        className="new-comment-textarea"
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={adjustHeight}
        onKeyDown={keyHandler}
        placeholder="Write a comment..."
      />
      <div className="new-comment-actions">
        <div className="emoji-section">
          <button
            className="newComment-btn"
            type="button"
            onClick={() => setShowEmojiPicker((p) => !p)}
            title="Emoji"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div ref={emojiRef} className="emoji-picker-popup">
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
        </div>
        <button
          className="newComment-btn"
          id="new-commen-btn-action"
          onClick={onSave}
          title="Save"
          disabled={!canSave}
        >
          <Save size={18} strokeWidth={1.5} />
        </button>
        <button
          className="newComment-btn"
          id="new-commen-btn-action"
          onClick={onCancel}
          title="Cancel"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default NewComment;
