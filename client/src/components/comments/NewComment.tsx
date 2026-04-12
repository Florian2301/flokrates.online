import './NewComment.css';

import type { AppDispatch, RootState } from '../../store/store';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Save, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import Picker from '@emoji-mart/react';
import { createComment } from '../../store/commentsSlice';
import data from '@emoji-mart/data';
import { resizeTextareaPreserveCaret } from '../../utils/textarea';

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
  const senderRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    const button = emojiButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const pickerHeight = 350;

    setOpenUpwards(spaceBelow < pickerHeight && spaceAbove > spaceBelow);

    setShowEmojiPicker((prev) => !prev);
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

  // UseEffect
  useLayoutEffect(() => {
    if (textareaRef.current) resizeTextareaPreserveCaret(textareaRef.current);
  }, []);

  useEffect(() => {
    senderRef.current?.focus();
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
        ref={senderRef}
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
        onKeyDown={keyHandler}
        placeholder="Write a comment..."
      />
      <div className="new-comment-actions">
        <div className="emoji-section">
          <button
            ref={emojiButtonRef}
            className="newComment-btn"
            type="button"
            onClick={toggleEmojiPicker}
            title="Emoji"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div
              ref={emojiRef}
              className={`emoji-picker-popup ${openUpwards ? 'up' : ''}`}
            >
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
