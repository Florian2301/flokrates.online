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
  deleteMessageThunk,
  fetchAttachmentsForMessage,
} from '../../store/messagesSlice';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Actor } from '../../types/ActorStyles';
import { Message } from '../../types/Message';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

type NewMessageProps = {
  newMessage?: Message;
  messageId: number;
  isNew?: boolean;
  onCancel: () => void;
};

type BackendAttachment = {
  attachmentId: number;
  messageId: number;
  kind: 'file' | 'external_url';
  href?: string | null;
  storageKey?: string | null;
  title?: string | null;
  contentType?: string | null;
  fileName?: string | null;
  previewHref?: string | null;
  deleted?: boolean;
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
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );
  const messages = useSelector(
    (state: RootState) => state.messages.chatmessages
  );
  const savedAttachments: BackendAttachment[] =
    useSelector(
      (s: RootState) => s.messages.attachmentsByMessageId?.[messageId]
    ) || [];
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 100 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showAttachmentsBar, setShowAttachmentsBar] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<'link' | 'file'>('link');
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = (ct?: string | null) => !!ct && ct.startsWith('image/');
  const isPdf = (ct?: string | null) => ct === 'application/pdf';

  const openBackendAttachment = (att: BackendAttachment) => {
    if (att.kind === 'external_url' && att.href) {
      window.open(att.href, '_blank', 'noopener,noreferrer');
      return;
    }
    const direct = att.href || att.previewHref;
    if (direct) {
      window.open(direct, '_blank', 'noopener,noreferrer');
      return;
    }
    console.warn('Kein href/previewHref für Attachment vorhanden:', att);
  };

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };

    window.addEventListener('mousemove', onDrag as any);
    window.addEventListener('mouseup', stopDrag as any);
  };

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initX + dx,
      y: dragRef.current.initY + dy,
    });
  };

  const stopDrag = () => {
    setDragging(false);
    dragRef.current = null;
    window.removeEventListener('mousemove', onDrag as any);
    window.removeEventListener('mouseup', stopDrag as any);
  };

  const keyEventMessage = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === 'Escape') {
      onCancel();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setEditedText((prev: any) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

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

  const addLinkAttachment = () => {
    if (!linkInput.trim()) return;
    const url = linkInput.trim();
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
    // reset input, damit das gleiche File erneut gewählt werden kann
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

      // Datei-Anhang → File-Objekt direkt an den Slice
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

  useEffect(() => {
    adjustHeight();
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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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

  return (
    <div
      className="new-message-window"
      style={{
        top: `${position.y}px`,
        left: '50%',
        transform: `translateX(calc(-50% + ${position.x}px))`,
      }}
      onMouseDown={startDrag}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div
        className="header"
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        style={{ padding: '8px', background: '#eee' }}
      ></div>
      <textarea
        id="newmessage-textarea"
        ref={textareaRef}
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        onInput={adjustHeight}
        onKeyDown={keyEventMessage}
      />
      <div className="actions" onMouseDown={startDrag} onMouseMove={onDrag}>
        <label className="newMessage-label">
          <select
            className="newMessage-select"
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
            id="newMessage-btn"
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-popup" ref={emojiPickerRef}>
              <Picker
                date={data}
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
        <label className="newMessage-label" title="Respond to message">
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
        </label>
        <label className="newMessage-label" title="move up or down">
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
          {/* Gespeicherte Attachments */}
          {!isNew && savedAttachments.length > 0 && (
            <>
              <div className="attachments-list">
                {savedAttachments
                  .filter((a) => !a.deleted)
                  .map((att) => {
                    const label =
                      att.title ||
                      att.fileName ||
                      att.href ||
                      `#${att.attachmentId}`;
                    const thumb =
                      isImage(att.contentType) && (att.previewHref || att.href)
                        ? (att.previewHref || att.href)!
                        : null;
                    const isLink = att.kind === 'external_url';

                    return (
                      <div
                        key={`saved-${att.attachmentId}`}
                        className="attachment-chip saved"
                        role="button"
                        title={label}
                        onClick={() => openBackendAttachment(att)}
                      >
                        <span className="chip-text">{label}</span>
                      </div>
                    );
                  })}
              </div>
              <hr className="attachments-sep" />
            </>
          )}
          {/* Eingabezeile für neue Attachments */}
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

          {/* Liste der pending Attachments */}
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
