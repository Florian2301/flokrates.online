import './ChatMessage.css';

import { ChevronsUp, PencilLine, Save, SquarePen, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  fetchAttachmentsForMessage,
  patchMessage,
  selectMessagesForChat,
  selectAttachmentsForMessage,
  type MessageAttachment,
} from '../../store/messagesSlice';

import { AppDispatch } from '../../store/store';
import { Message } from '../../types/Message';
import NewMessage from './NewMessage';
import Picker from '@emoji-mart/react';
import ReactModal from 'react-modal';
import { RootState } from '../../store/store';
import { actorStyles } from '../../types/ActorStyles';
import data from '@emoji-mart/data';
import { selectIsAuthenticated } from '../../store/authSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import {
  isImageContentType,
  isPdfContentType,
  toAbsoluteUrl,
} from './Attachments';
import { resizeTextareaPreserveCaret } from '../../utils/textarea';

type ChatMessageProps = {
  message: Message;
  isEditing: boolean;
  activeEditId: number | null;
  setActiveEditId: React.Dispatch<React.SetStateAction<number | null>>;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isEditing,
  activeEditId,
  setActiveEditId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuthenticated);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerType, setViewerType] = useState<'image' | 'pdf' | null>(null);

  const { messageId, messageText, actor, messageNumber, respId } = message;
  const { colorClass, alignClass, actorName } =
    actorStyles[actor as keyof typeof actorStyles];

  const [edit, setEdit] = useState(isEditing);
  const [editedText, setEditedText] = useState(messageText);
  const [fullEdit, setFullEdit] = useState(false);

  const messagesInChat = useSelector((state: RootState) =>
    selectMessagesForChat(state, message.chatId)
  );
  const responseMessage = respId
    ? messagesInChat.find((m) => m.messageId === respId)
    : null;

  const attachments = useSelector((s: RootState) =>
    selectAttachmentsForMessage(s, messageId)
  );

  const openAttachment = (att: MessageAttachment) => {
    // externe Links → im neuen Tab
    if (att.kind === 'external_url') {
      const url = toAbsoluteUrl(att.href);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Files
    const direct = toAbsoluteUrl(att.href || att.previewHref || null);
    if (direct) {
      if (isImageContentType(att.contentType)) {
        setViewerSrc(direct);
        setViewerType('image');
        setViewerOpen(true);
        return;
      }
      if (isPdfContentType(att.contentType)) {
        window.open(direct, '_blank', 'noopener,noreferrer');
        return;
      }

      window.open(direct, '_blank', 'noopener,noreferrer');
      return;
    }
    console.warn('No href/preview available for attachment', att);
  };

  // save
  const handleSaveEdit = () => {
    if (!isAuth) return;
    dispatch(
      patchMessage({
        messageId,
        updates: {
          messageText: editedText,
        },
      })
    );
    setEdit(false);
    setActiveEditId(null);
  };

  const scrollToMessage = (targetId?: number | null) => {
    if (!targetId) return;
    const el = document.getElementById(`message-${targetId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('message-highlight');
    setTimeout(() => el.classList.remove('message-highlight'), 2000);
  };

  // jump to response
  const handleJumpToMessage = () => {
    scrollToMessage(responseMessage?.messageId);
  };

  // emoji
  const handleEmojiSelect = (emoji: any) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;

    const newText = value.slice(0, start) + emoji.native + value.slice(end);

    setEditedText(newText);

    requestAnimationFrame(() => {
      const pos = start + emoji.native.length;
      ta.setSelectionRange(pos, pos);
    });
    setShowEmojiPicker(false);
    setFullEdit(false);
  };

  const handleTextareaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    const ta = e.currentTarget;
    const scrollY = window.scrollY;
    setEditedText(ta.value);
    resizeTextareaPreserveCaret(ta);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const keyEventMessage = (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (event.code === 'Escape') {
      setEdit(false);
      setActiveEditId(null);
    }
  };

  // UseEffects
  useEffect(() => {
    dispatch(fetchAttachmentsForMessage(messageId));
  }, [dispatch, messageId]);

  // prevent jumping cursor to start
  useEffect(() => {
    if (!edit || !textareaRef.current) return;

    const ta = textareaRef.current;

    resizeTextareaPreserveCaret(ta);

    requestAnimationFrame(() => {
      const pos = ta.value.length;
      ta.setSelectionRange(pos, pos);
    });
  }, [edit]);

  useEffect(() => {
    if (!isAuth) return;

    function handleSaveEvent(e: CustomEvent<{ id: number }>) {
      if (e.detail.id === messageId && edit) {
        handleSaveEdit();
      }
    }

    window.addEventListener('save-message', handleSaveEvent as EventListener);

    return () => {
      window.removeEventListener(
        'save-message',
        handleSaveEvent as EventListener
      );
    };
  }, [isAuth, messageId, edit, handleSaveEdit]);

  return (
    <div
      className={`message-wrapper ${alignClass}`}
      id={`message-${messageId}`}
    >
      <div className={`message-container ${edit ? 'edit' : 'save'}`}>
        {respId && responseMessage && (
          <div
            className="message-reply-context"
            /*onClick={() => scrollToMessage(responseMessage.messageId)}*/
            title={`Zur Nachricht #${responseMessage.messageNumber} springen`}
          >
            <div className="message-reply-meta">
              <span className="reply-ref">
                #{responseMessage.messageNumber}
              </span>
              <span
                className={`reply-actor ${
                  actorStyles[responseMessage.actor as keyof typeof actorStyles]
                    .colorClass
                }`}
              >
                {
                  actorStyles[responseMessage.actor as keyof typeof actorStyles]
                    .actorName
                }
              </span>
            </div>
            <div className="message-reply-snippet">
              {responseMessage.messageText}
            </div>
          </div>
        )}
        <div className="message-header">
          <div>
            <span id="message-span"># {messageNumber}</span>
            <span className={colorClass}>{actorName}</span>
          </div>

          {isAuth ? (
            <div className="message-header-block">
              {edit && (
                <div className="emoji-section">
                  <button
                    id="emoji-btn"
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    title="Emoji"
                  >
                    😊
                  </button>
                  {showEmojiPicker && (
                    <div className="emoji-picker-popup">
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
              )}
              <span
                className="message-button-edit"
                title="Save"
                onClick={() => {
                  if (edit) {
                    handleSaveEdit();
                    setEdit(false);
                  } else {
                    if (activeEditId && activeEditId !== messageId) {
                      const event = new CustomEvent('save-message', {
                        detail: { id: activeEditId },
                      });
                      window.dispatchEvent(event);
                    }
                    setActiveEditId(messageId);
                    setEdit(true);
                  }
                }}
              >
                {edit ? <Save size={18} strokeWidth={1.5} /> : null}
              </span>
              <span
                className="message-button-edit"
                title="Edit/Cancel"
                onClick={() => {
                  setEdit(!edit);
                }}
              >
                {edit ? (
                  <X size={18} strokeWidth={1.5} />
                ) : (
                  <PencilLine size={18} strokeWidth={1.5} />
                )}
              </span>
              <span
                className="message-button-edit"
                title="full edit"
                onClick={() => {
                  if (fullEdit) {
                    const event = new CustomEvent('save-message', {
                      detail: { id: messageId },
                    });
                    window.dispatchEvent(event);
                    setFullEdit(false);
                  } else {
                    if (activeEditId && activeEditId !== messageId) {
                      const event = new CustomEvent('save-message', {
                        detail: { id: activeEditId },
                      });
                      window.dispatchEvent(event);
                    }
                    setActiveEditId(messageId);
                    setFullEdit(true);
                  }
                }}
              >
                <SquarePen size={18} strokeWidth={1.5} />
              </span>
            </div>
          ) : (
            <div className="message-header-block">
              {respId && (
                <span
                  className="message-button-edit"
                  id="message-button-response-chevron"
                  title="Jump to original message"
                  onClick={handleJumpToMessage}
                >
                  <ChevronsUp size={25} strokeWidth={1.5} />
                </span>
              )}
            </div>
          )}
        </div>

        <div className="message-body">
          {edit ? (
            <textarea
              className="message-textarea"
              value={editedText}
              ref={textareaRef}
              onKeyDown={keyEventMessage}
              onChange={handleTextareaChange}
            />
          ) : (
            <div className="message-display">{messageText}</div>
          )}
        </div>
        <div className="message-bottom">
          {attachments.length > 0 && (
            <div className="attachments-row">
              {attachments.map((att) => {
                const label =
                  att.title ||
                  att.fileName ||
                  att.href ||
                  `#${att.attachmentId}`;

                return (
                  <div
                    key={att.attachmentId}
                    className="attachment-pill"
                    role="button"
                    title={label}
                    onClick={() => openAttachment(att)}
                  >
                    <div className="pill-text" title={label}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inline-Viewer (Modal) für Bilder/PDF) */}
        <ReactModal
          isOpen={viewerOpen}
          onRequestClose={() => setViewerOpen(false)}
          className="att-modal"
          overlayClassName="att-modal-overlay"
          ariaHideApp={false}
        >
          <button
            className="att-modal-close"
            onClick={() => setViewerOpen(false)}
          >
            ✕
          </button>
          {viewerSrc && viewerType === 'image' && (
            <img className="att-modal-content" src={viewerSrc} alt="" />
          )}
          {viewerSrc && viewerType === 'pdf' && (
            <iframe className="att-modal-content" src={viewerSrc} title="PDF" />
          )}
        </ReactModal>
      </div>

      {fullEdit && isAuth && (
        <NewMessage
          messageId={messageId}
          isNew={false}
          onCancel={() => setFullEdit(false)}
        />
      )}
    </div>
  );
};

export default ChatMessage;
