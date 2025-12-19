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

type ChatMessageProps = {
  message: Message;
  isEditing: boolean;
  activeEditId: number | null;
  setActiveEditId: React.Dispatch<React.SetStateAction<number | null>>;
  previewMode?: boolean;
  onClosePreview?: () => void;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isEditing,
  activeEditId,
  setActiveEditId,
  previewMode = false,
  onClosePreview = () => {},
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
  const [showResponsePopup, setShowResponsePopup] = useState(false);

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

  // jump to response
  const handleJumpToMessage = () => {
    if (!messageId) return;

    const target = document.getElementById(`message-${messageId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('message-highlight');
      setTimeout(() => target.classList.remove('message-highlight'), 2000);
    }
    setShowResponsePopup(false);
  };

  // emoji
  const handleEmojiSelect = (emoji: any) => {
    setEditedText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    setFullEdit(false);
  };

  const handleClosePreviewClick: React.MouseEventHandler<HTMLSpanElement> = (
    e
  ) => {
    e.stopPropagation();
    onClosePreview();
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
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

  useEffect(() => {
    if (edit) adjustHeight();
  }, [edit, editedText]);

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
  }, [edit, editedText]);

  return (
    <div
      className={`message-wrapper ${alignClass}`}
      id={`message-${messageId}`}
    >
      {showResponsePopup && responseMessage && (
        <div className="response-popup" onClick={(e) => e.stopPropagation()}>
          <ChatMessage
            message={responseMessage}
            isEditing={false}
            activeEditId={null}
            setActiveEditId={() => {}}
            previewMode={true}
            onClosePreview={() => setShowResponsePopup(false)}
          />
        </div>
      )}
      <div
        className={`message-container ${edit ? 'edit' : 'save'}`}
        id={`${previewMode ? 'message-container-preview' : undefined}`}
      >
        <div
          className={`message-header ${isAuth ? 'auth-header' : 'guest-header'} ${
            previewMode ? 'preview-header' : ''
          }`}
        >
          <div className="message-header-block">
            <span id="message-span"># {messageNumber}</span>
            <span className={colorClass}>{actorName}</span>
          </div>
          {respId && responseMessage && (
            <div className="response-info">
              <span>
                <button
                  className="response-link"
                  onClick={() => setShowResponsePopup((prev) => !prev)}
                >
                  {`${
                    showResponsePopup
                      ? 'Close preview'
                      : 'Response to #' + responseMessage.messageNumber
                  }`}
                </button>
              </span>
            </div>
          )}
          {!previewMode && isAuth ? (
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
              <span
                className="message-button-edit"
                title="close"
                onClick={handleClosePreviewClick}
              >
                <X size={18} strokeWidth={1.5} />
              </span>

              {previewMode && (
                <span
                  className="message-button-edit"
                  id="message-button-popup"
                  title="Jump to original message"
                  onClick={handleJumpToMessage}
                >
                  <ChevronsUp size={18} strokeWidth={1.5} />
                </span>
              )}
            </div>
          )}
        </div>
        <div className="message-body">
          {edit ? (
            <textarea
              id="message-textarea"
              value={editedText}
              ref={textareaRef}
              onKeyDown={keyEventMessage}
              onChange={(e) => setEditedText(e.target.value)}
              onInput={adjustHeight}
            />
          ) : (
            <div id="message-display">{messageText}</div>
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
                const thumb =
                  isImageContentType(att.contentType) &&
                  (att.previewHref || att.href)
                    ? (att.previewHref || att.href)!
                    : null;
                const isLink = att.kind === 'external_url';

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
