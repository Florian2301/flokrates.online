import './NewMessage.css';

import { AppDispatch, RootState } from '../../store/store';
import {
  ArrowUpDown,
  CornerRightUp,
  Paperclip,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  NewAttachment,
  addAttachmentsToExistingMessage,
  changeMessage,
  createMessageWithAttachments,
  deleteAttachment,
  deleteMessageThunk,
  fetchAttachmentsForMessage,
  selectMessagesForChat,
  selectAttachmentsForMessage,
  type MessageAttachment,
} from '../../store/messagesSlice';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Actor } from '../../types/ActorStyles';
import { Message } from '../../types/Message';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { isImageContentType, toAbsoluteUrl } from './Attachments';
import { resizeTextareaPreserveCaret } from '../../utils/textarea';
import { Dropdown } from 'react-bootstrap';

type NewMessageProps = {
  newMessage?: Message;
  messageId: number;
  isNew?: boolean;
  onCancel: () => void;
};

type PendingAttachment =
  | { id: string; kind: 'external_url'; href: string; title?: string }
  | {
      id: string;
      kind: 'file';
      file: File;
      previewUrl?: string;
      title?: string;
    };

const NewMessage: React.FC<NewMessageProps> = ({
  messageId,
  isNew,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );

  const messages = useSelector((state: RootState) =>
    selectedChat ? selectMessagesForChat(state, selectedChat.chatId) : []
  );
  const tempMessage: Message = {
    messageId: messageId,
    messageText: '',
    actor: 'FLO',
    messageNumber: messages.length + 1,
    respId: null,
    chatId: selectedChat!.chatId,
  };
  const message = isNew
    ? tempMessage
    : (messages.find((m) => m.messageId === messageId) ?? tempMessage);
  const maxMessageNumber = messages.length;

  const initialText = isNew ? '' : message.messageText;
  const initialActor = isNew ? 'FLO' : message.actor;
  const initialNumber = isNew ? messages.length + 1 : message.messageNumber;
  const initialRespId = isNew ? null : message.respId;
  const [editedText, setEditedText] = useState(initialText);
  const [selectedActor, setSelectedActor] = useState(initialActor);
  const [selectedMessageNumber, setSelectedMessageNumber] =
    useState(initialNumber);
  const [respMessageId, setRespMessageId] = useState<number | null>(
    initialRespId
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 100 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  const savedAttachments: MessageAttachment[] =
    useSelector((s: RootState) => selectAttachmentsForMessage(s, messageId)) ||
    [];
  const [showAttachmentsBar, setShowAttachmentsBar] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<'link' | 'file'>('link');
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const handleSave = async () => {
    const attachmentsToSend: NewAttachment[] =
      mapPendingToNewAttachments(pendingAttachments);
    if (isNew) {
      await dispatch(
        createMessageWithAttachments({
          message: {
            messageText: editedText,
            actor: selectedActor,
            respId: respMessageId,
            messageNumber: selectedMessageNumber,
            chatId: message.chatId,
          },
          attachments: attachmentsToSend,
        })
      ).unwrap();
      onCancel();
    } else {
      await dispatch(
        changeMessage({
          messageId,
          updatedText: editedText,
          newActor: selectedActor,
          newMessageNumber: selectedMessageNumber,
          oldMessageNumber: message.messageNumber,
          responseId: respMessageId,
        })
      );
      if (attachmentsToSend.length) {
        await dispatch(
          addAttachmentsToExistingMessage({
            messageId: message.messageId,
            attachments: attachmentsToSend,
          })
        ).unwrap();
        await dispatch(fetchAttachmentsForMessage(message.messageId));
        setPendingAttachments([]);
      }
      onCancel();
    }
  };

  const handleDelete = () => {
    const ok = window.confirm('Delete this message?');
    if (!ok) return;
    dispatch(deleteMessageThunk(message.messageId));
    onCancel();
  };

  const openBackendAttachment = (att: MessageAttachment) => {
    if (att.kind === 'external_url' && att.href) {
      const url = toAbsoluteUrl(att.href);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    const direct = toAbsoluteUrl(att.href || att.previewHref);
    if (direct) {
      window.open(direct, '_blank', 'noopener,noreferrer');
      return;
    }
    console.warn('Kein href/previewHref für Attachment vorhanden:', att);
  };

  const addLinkAttachment = () => {
    if (!linkInput.trim()) return;
    let url = linkInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    setPendingAttachments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: 'external_url',
        href: url,
        title: linkTitle || undefined,
      },
    ]);
    setLinkInput('');
    setLinkTitle('');
  };

  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
    setPendingAttachments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: 'file',
        file,
        previewUrl,
        title: file.name,
      },
    ]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // attachments
  function mapPendingToNewAttachments(
    pending: PendingAttachment[]
  ): NewAttachment[] {
    return pending.map((p, index) => {
      if (p.kind === 'external_url') {
        return {
          kind: 'external_url',
          href: p.href,
          title: p.title ?? null,
          sortOrder: index,
        };
      }

      return {
        kind: 'file',
        file: p.file,
        title: p.title ?? null,
        sortOrder: index,
      };
    });
  }

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDeleteSavedAttachment = (att: MessageAttachment) => {
    const ok = window.confirm('Delete this attachment?');
    if (!ok) return;
    dispatch(
      deleteAttachment({
        messageId: att.messageId,
        attachmentId: att.attachmentId,
      })
    );
  };

  // drag & drop
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initX + dx,
      y: dragRef.current.initY + dy,
    });
  };

  const stopDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const keyEventMessage = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === 'Escape') {
      onCancel();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;

    const newText = value.slice(0, start) + emoji.native + value.slice(end);

    setEditedText(newText);

    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + emoji.native.length;
      ta.setSelectionRange(pos, pos);
    });
    setShowEmojiPicker(false);
  };

  const handleTextareaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    const ta = e.currentTarget;

    setEditedText(ta.value);
  };

  // UseEffects
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const prevScrollTop = ta.scrollTop;

    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';

    ta.scrollTop = prevScrollTop;
  }, [editedText]);

  useEffect(() => {
    if (!isNew) {
      dispatch(fetchAttachmentsForMessage(messageId));
    }
  }, [dispatch, isNew, messageId]);

  useEffect(() => {
    function handleSaveEvent(e: Event) {
      const customEvent = e as CustomEvent<{ id: number }>;
      if (customEvent.detail.id === message.messageId) {
        handleSave();
      }
    }

    window.addEventListener('save-message', handleSaveEvent);
    return () => {
      window.removeEventListener('save-message', handleSaveEvent);
    };
  }, [
    message.messageId,
    editedText,
    selectedActor,
    selectedMessageNumber,
    respMessageId,
  ]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    requestAnimationFrame(() => {
      ta.focus();
    });
  }, []);

  useEffect(() => {
    return () => {
      pendingAttachments.forEach((a) => {
        if (a.kind === 'file' && a.previewUrl)
          URL.revokeObjectURL(a.previewUrl);
      });
    };
  }, [pendingAttachments]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const savedLinks = savedAttachments.filter(
    (a) => !a.deleted && a.kind === 'external_url'
  );
  const savedFiles = savedAttachments.filter(
    (a) => !a.deleted && a.kind === 'file'
  );

  return (
    <div
      className="new-message-window"
      style={{
        top: `${position.y}px`,
        left: `${position.x + window.innerWidth / 2}px`,
      }}
    >
      <div
        className="new-message-header"
        onPointerDown={startDrag}
        onPointerMove={dragging ? onDrag : undefined}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      ></div>
      <textarea
        className="new-message-textarea"
        ref={textareaRef}
        value={editedText}
        onChange={handleTextareaChange}
        onKeyDown={keyEventMessage}
      />
      <div className="actions">
        <label className="newMessage-label">
          <select
            className="newMessage-select-actor"
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value as Actor)}
          >
            <option value="FLO">Flokrates</option>
            <option value="PAB">Pablo</option>
            <option value="LOT">Lotharius</option>
          </select>
        </label>
        <div className="emoji-section">
          <button
            className="newMessage-btn"
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-popup" ref={emojiPickerRef}>
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => handleEmojiSelect(emoji)}
                previewPosition="none"
                skinTonePosition="none"
                theme="light"
                sheetSize={32}
              />
            </div>
          )}
        </div>
        <button
          type="button"
          className="newMessage-btn"
          title="Add Attachment"
          onClick={() => setShowAttachmentsBar((s) => !s)}
        >
          <Paperclip size={18} strokeWidth={1.5} />
        </button>
        <button className="newMessage-btn" onClick={handleSave} title="Save">
          <Save size={18} strokeWidth={1.5} />
        </button>
        <button className="newMessage-btn" onClick={onCancel} title="Cancel">
          <X size={18} strokeWidth={1.5} />
        </button>
        {/*<label className="newMessage-label" title="Respond to message">
          <CornerRightUp size={18} strokeWidth={1.5} />
          <select
            className="newMessage-select"
            value={respMessageId ?? '-'}
            onChange={(e) =>
              setRespMessageId(
                e.target.value === '-' ? null : Number(e.target.value)
              )
            }
          >
            <option value="-">-</option>
            {[...messages]
              .filter((msg) => msg.messageNumber < selectedMessageNumber)
              .sort((a, b) => a.messageNumber - b.messageNumber)
              .map((msg) => (
                <option key={msg.messageId} value={msg.messageId}>
                  {msg.messageNumber}
                </option>
              ))}
          </select>
        </label>*/}
        <label className="newMessage-label" title="Respond to message">
          <CornerRightUp size={18} strokeWidth={1.5} />
          <Dropdown className="newMessage-dropdown-wrapper">
            <Dropdown.Toggle
              className="newMessage-select"
              title="Respond to message"
            >
              {respMessageId ?? '-'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="newMessage-dropdown">
              <Dropdown.Item onClick={() => setRespMessageId(null)}>
                -
              </Dropdown.Item>

              {[...messages]
                .filter((msg) => msg.messageNumber < selectedMessageNumber)
                .sort((a, b) => a.messageNumber - b.messageNumber)
                .map((msg) => (
                  <Dropdown.Item
                    key={msg.messageId}
                    onClick={() => setRespMessageId(msg.messageId)}
                  >
                    {msg.messageNumber}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        </label>
        {/*<label className="newMessage-label" title="move up or down">
          <section id="number">
            <ArrowUpDown size={18} strokeWidth={1.5} />
          </section>
          <select
            className="newMessage-select"
            value={'-'}
            onChange={(e) => setSelectedMessageNumber(Number(e.target.value))}
          >
            <option value="-" disabled hidden>
              -
            </option>
            {Array.from({ length: maxMessageNumber }, (_, i) => i + 1)
              .filter((num) => {
                if (!respMessageId) return true;
                const respMsg = messages.find(
                  (m) => m.messageId === respMessageId
                );
                if (!respMsg) return true;
                return num > respMsg.messageNumber;
              })
              .map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
          </select>
        </label>*/}
        <label className="newMessage-label" title="move up or down">
          <section id="number">
            <ArrowUpDown size={18} strokeWidth={1.5} />
          </section>
          <Dropdown className="newMessage-dropdown-wrapper">
            <Dropdown.Toggle
              className="newMessage-select"
              title="Respond to message"
            >
              {selectedMessageNumber ?? '-'}
            </Dropdown.Toggle>

            <Dropdown.Menu className="newMessage-dropdown">
              {Array.from({ length: maxMessageNumber }, (_, i) => i + 1)
                .filter((num) => {
                  if (!respMessageId) return true;

                  const respMsg = messages.find(
                    (m) => m.messageId === respMessageId
                  );

                  if (!respMsg) return true;

                  return num > respMsg.messageNumber;
                })
                .map((num) => (
                  <Dropdown.Item
                    key={num}
                    onClick={() => setSelectedMessageNumber(num)}
                  >
                    {num}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        </label>
        <button
          className="newMessage-btn"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 size={18} strokeWidth={1.5} />
        </button>
      </div>
      {showAttachmentsBar && (
        <div className="attachments-bar">
          {!isNew && (savedLinks.length > 0 || savedFiles.length > 0) && (
            <>
              {savedLinks.length > 0 && (
                <div className="attachments-list-row">
                  <div className="attachments-list">
                    {savedLinks.map((att) => {
                      const label =
                        att.title ||
                        att.href ||
                        att.fileName ||
                        `#${att.attachmentId}`;

                      return (
                        <div
                          key={`saved-link-${att.attachmentId}`}
                          className="attachment-chip saved"
                          title={label}
                        >
                          <span
                            className="chip-text"
                            onClick={() => openBackendAttachment(att)}
                          >
                            {label}
                          </span>
                          <button
                            className="chip-remove"
                            onClick={() => handleDeleteSavedAttachment(att)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Files */}
              {savedFiles.length > 0 && (
                <div className="attachments-list-row">
                  <div className="attachments-list">
                    {savedFiles.map((att) => {
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

                      return (
                        <div
                          key={`saved-file-${att.attachmentId}`}
                          className="attachment-chip saved"
                          title={label}
                        >
                          {thumb && (
                            <img
                              src={thumb}
                              alt=""
                              className="chip-thumb"
                              onClick={() => openBackendAttachment(att)}
                            />
                          )}
                          <span
                            className="chip-text"
                            onClick={() => openBackendAttachment(att)}
                          >
                            {label}
                          </span>
                          <button
                            className="chip-remove"
                            onClick={() => handleDeleteSavedAttachment(att)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <hr className="attachments-sep" />
            </>
          )}

          {/* New Attachments */}
          <div className="attachments-input-row">
            <div className="attachment-mode">
              <label>
                <input
                  type="radio"
                  name="att-mode"
                  value="link"
                  checked={attachmentMode === 'link'}
                  onChange={() => setAttachmentMode('link')}
                />
                Link
              </label>
              <label>
                <input
                  type="radio"
                  name="att-mode"
                  value="file"
                  checked={attachmentMode === 'file'}
                  onChange={() => setAttachmentMode('file')}
                />
                File
              </label>
            </div>

            {attachmentMode === 'link' ? (
              <div className="attachment-fields">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  className="attachment-input"
                />
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="attachment-input"
                />
                <button
                  type="button"
                  className="newMessage-btn"
                  onClick={addLinkAttachment}
                >
                  <Plus size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div className="attachment-fields">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onFilePicked}
                  id="attachment-file-upload"
                />
              </div>
            )}
          </div>

          {/* Pending Attachments */}
          <div className="attachments-list">
            {pendingAttachments.map((att) => (
              <div key={att.id} className="attachment-chip pending">
                {att.kind === 'external_url' ? (
                  <>
                    <span className="chip-text">{att.title ?? att.href}</span>
                  </>
                ) : (
                  <>
                    {'previewUrl' in att && att.previewUrl ? (
                      <img src={att.previewUrl} alt="" className="chip-thumb" />
                    ) : null}
                    <span className="chip-text">
                      {att.title ?? att.file.name}
                    </span>
                  </>
                )}
                <button
                  className="chip-remove"
                  onClick={() => removeAttachment(att.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMessage;
