import './ChatInfo.css';

import { AppDispatch, RootState } from '../../store/store';
import {
  BookOpenCheck,
  BrushCleaning,
  FileText,
  PencilLine,
  Save,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react';
import { Chat, Status, statusMap } from '../../types/Chats';
import { LanguageCode, languageMap } from '../../constants/language';
import React, { useEffect, useMemo, useState } from 'react';
import {
  createChat,
  deleteChatThunk,
  fetchChats,
  fetchChatsWithCounts,
  saveSingleChat,
  selectChatsLoaded,
  selectDraftsByLanguage,
  selectPublishedChatsByLanguage,
  setSelectedChat,
} from '../../store/chatsSclice';
import {
  deleteReference,
  fetchRefsByChat,
  selectRefsByChat,
  upsertReference,
} from '../../store/networksSclice';
import {
  fetchMessagesForChat,
  selectMessagesForChat,
} from '../../store/messagesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { ChatInfoRow } from './ChatInfoRow';
import ChatPdf from '../pdf/ChatPdf';
import CommentBox from '../commentbox/CommentBox';
import { DraftListTable } from './DraftListTable';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { selectIsAuthenticated } from '../../store/authSlice';
import { selectLanguage } from '../../store/languageSlice';
import { useNavigate } from 'react-router-dom';

const ChatInfo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const lang = useSelector(selectLanguage);
  const isAuth = useSelector(selectIsAuthenticated);
  const [editMode, setEditMode] = useState(false);
  type ViewMode = 'drafts' | 'comments';
  const [viewMode, setViewMode] = useState<ViewMode>('drafts');

  // chats
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );
  const chats = useSelector((state: RootState) =>
    state.chats.chats.filter((c) => c.language === lang)
  );
  const drafts = useSelector((state: RootState) =>
    selectDraftsByLanguage(state, lang)
  );
  const chatsLoaded = useSelector(selectChatsLoaded);
  const allPublishedForLang = useSelector((state: RootState) =>
    selectPublishedChatsByLanguage(state, lang)
  );
  const [chatForm, setChatForm] = useState<Partial<Chat>>({});
  const chatId = chatForm.chatId ?? selectedChat?.chatId ?? null;
  const publishedChats = allPublishedForLang.filter(
    (c) => c.chatId !== chatForm?.chatId
  );

  // comments count
  const commentsCount = useSelector((s: RootState) => {
    if (!chatId) return 0;
    return s.comments.byChatId[chatId]?.length ?? 0;
  });

  // messages
  const messages = useSelector((state: RootState) =>
    selectedChat ? selectMessagesForChat(state, selectedChat.chatId) : []
  );

  // date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // create
  const handleCreate = async () => {
    if (!isAuth) return;
    const newChatData: Omit<Chat, 'chatId'> = {
      title: 'draft',
      description: '',
      tags: '',
      language: lang,
      chatNumber: null,
      status: 'DRA' as Status,
      referencedChatIds: [],
      datePublished: null,
      dateCreated: new Date().toISOString(),
      dateModified: null,
    };

    const result = await dispatch(createChat(newChatData));

    if (createChat.fulfilled.match(result)) {
      setEditMode(true);
      dispatch(setSelectedChat(result.payload));
      setChatForm(result.payload);
    }
  };

  // change
  const handleChange = (field: keyof Chat, value: any) => {
    if (!isAuth) return;
    setChatForm((prev) => ({ ...prev, [field]: value }));
  };

  // save
  const handleSave = async () => {
    if (!isAuth) return;
    if (!chatForm.chatId) return;
    const payloadRefs = Array.isArray(chatForm.referencedChatIds)
      ? chatForm.referencedChatIds
      : [];
    const result = await dispatch(
      saveSingleChat({
        chatId: chatForm.chatId,
        updates: {
          ...chatForm,
          chatNumber: chatForm.chatNumber,
          referencedChatIds: payloadRefs,
          datePublished:
            chatForm.status === 'PUB' && !chatForm.datePublished
              ? new Date().toISOString()
              : chatForm.datePublished,
        },
      })
    );

    if (!saveSingleChat.fulfilled.match(result)) return;

    const refetch = await dispatch(fetchChats());
    if (fetchChats.fulfilled.match(refetch)) {
      const list = refetch.payload as Chat[];
      const updated = list.find((c) => c.chatId === chatForm.chatId);
      if (updated) {
        setEditMode(false);
        dispatch(setSelectedChat(updated));
        setChatForm(updated);
      }
    }
  };

  // delete
  const handleDelete = async () => {
    if (!isAuth) return;
    if (!chatForm?.chatId) return;
    const ok = window.confirm('Delete this chat?');
    if (!ok) return;
    const result = await dispatch(deleteChatThunk(chatForm.chatId));
    if (deleteChatThunk.fulfilled.match(result)) {
      handleClear();
    }
  };

  // clear
  const handleClear = () => {
    setChatForm({});
    dispatch(setSelectedChat(null));
    setEditMode(false);
  };

  // References
  const refs = useSelector((state: RootState) =>
    chatId ? selectRefsByChat(state, chatId) : []
  );
  const currentRefIds = refs.map((n) => n.refId);
  const refsForPdf = useMemo(() => {
    const ids =
      currentRefIds.length > 0
        ? currentRefIds
        : (selectedChat?.referencedChatIds ?? []);

    if (!ids?.length) return [];
    return ids
      .map((id) => chats.find((c) => c.chatId === id))
      .filter((c): c is Chat => Boolean(c))
      .map((c) => ({
        chatId: c.chatId,
        chatNumber: c.chatNumber,
        title: c.title,
      }));
  }, [currentRefIds, selectedChat, chats]);

  const handleAddReference = (refId: number) => {
    if (!isAuth) return;
    if (!chatId || !refId) return;
    if (currentRefIds.includes(refId)) return;
    dispatch(upsertReference({ chatId, refId }));
  };

  const handleRemoveReference = (refId: number) => {
    if (!isAuth) return;
    if (!chatId) return;
    const ok = window.confirm('Delete this reference?');
    if (!ok) return;
    dispatch(deleteReference({ chatId, refId }));
  };

  const openReferencedChat = (chatId: number) => {
    const target = chats.find((c) => c.chatId === chatId);
    if (!target) return;
    dispatch(setSelectedChat(target));
    dispatch(fetchMessagesForChat(target.chatId));
    navigate('/chatbox');
  };

  // useEffects
  useEffect(() => {
    if (selectedChat) {
      setChatForm(selectedChat);
      if (messages.length === 0) {
        dispatch(fetchMessagesForChat(selectedChat.chatId));
      }
    } else {
      setChatForm({});
    }
  }, [selectedChat, messages.length, dispatch]);

  useEffect(() => {
    if (!chatsLoaded) {
      dispatch(fetchChatsWithCounts());
    }
  }, [chatsLoaded, dispatch]);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchRefsByChat(chatId));
    }
  }, [dispatch, chatId]);

  useEffect(() => {
    if (selectedChat && selectedChat.language !== lang) {
      dispatch(setSelectedChat(null));
    }
  }, [lang, selectedChat, dispatch]);

  return (
    <div className="chatinfo">
      <ChatInfoRow label={lang === 'EN' ? 'Number:' : 'Nummer:'}>
        {editMode && isAuth ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.chatNumber ?? ''}
            onChange={(e) =>
              handleChange('chatNumber', parseInt(e.target.value) || 0)
            }
          />
        ) : (
          <p className="chatpara">{chatForm.chatNumber ?? ''}</p>
        )}
      </ChatInfoRow>
      <ChatInfoRow label={lang === 'EN' ? 'Title:' : 'Titel:'}>
        {editMode && isAuth ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.title ?? ''}
            onChange={(e) => handleChange('title', e.target.value)}
            autoFocus
          />
        ) : (
          <p className="chatpara">{chatForm.title ?? ''}</p>
        )}
      </ChatInfoRow>
      <ChatInfoRow label={lang === 'EN' ? 'Topic:' : 'Thema:'}>
        {editMode && isAuth ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.tags ?? ''}
            onChange={(e) => handleChange('tags', e.target.value)}
          />
        ) : (
          <p className="chatpara">{chatForm.tags ?? ''}</p>
        )}
      </ChatInfoRow>
      <ChatInfoRow label={lang === 'EN' ? 'Story:' : 'Handlung:'}>
        {editMode && isAuth ? (
          <textarea
            className="chatinfo-input"
            rows={6}
            value={chatForm.description ?? ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        ) : (
          <p className="chatpara">{chatForm.description ?? ''}</p>
        )}
      </ChatInfoRow>
      {isAuth && (
        <ChatInfoRow label="Status:">
          {editMode ? (
            <select
              className="chatinfo-input"
              value={chatForm.status ?? ''}
              onChange={(e) => handleChange('status', e.target.value as Status)}
            >
              <option value="" disabled>
                -- Select Status --
              </option>
              {Object.entries(statusMap).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <p className="chatpara">{chatForm.status ?? ''}</p>
          )}
        </ChatInfoRow>
      )}
      {isAuth && (
        <ChatInfoRow label={lang === 'EN' ? 'Created:' : 'Erstellt:'}>
          <p className="chatpara">
            {chatForm.dateCreated ? formatDate(chatForm.dateCreated) : ''}
          </p>
        </ChatInfoRow>
      )}
      {isAuth && (
        <ChatInfoRow label={lang === 'EN' ? 'Modified:' : 'Geändert:'}>
          <p className="chatpara">
            {chatForm.dateModified ? formatDate(chatForm.dateModified) : ''}
          </p>
        </ChatInfoRow>
      )}
      {chatForm.datePublished && (
        <ChatInfoRow label={lang === 'EN' ? 'Published:' : 'Veröffentlicht:'}>
          <p className="chatpara">
            {chatForm.datePublished ? formatDate(chatForm.datePublished) : ''}
          </p>
        </ChatInfoRow>
      )}
      <ChatInfoRow label={lang === 'EN' ? 'Language:' : 'Sprache:'}>
        {editMode && isAuth ? (
          <select
            className="chatinfo-input"
            value={chatForm.language ?? 'DE'}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            {Object.entries(languageMap).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <p className="chatpara">
            {chatForm.language
              ? languageMap[chatForm.language as LanguageCode]
              : ''}
          </p>
        )}
      </ChatInfoRow>
      {refsForPdf.length !== 0 || editMode ? (
        <ChatInfoRow label={lang === 'EN' ? 'Relation to:' : 'Bezug zu:'}>
          {editMode && isAuth ? (
            <div className="chatinfo-ref-editor">
              <select
                className="chatinfo-input"
                onChange={(e) => handleAddReference(Number(e.target.value))}
                value=""
              >
                <option value="" disabled>
                  + reference
                </option>
                {publishedChats.map((c) => (
                  <option key={c.chatId} value={c.chatId}>
                    {`#${c.chatNumber ?? '—'} · ${c.title}`}
                  </option>
                ))}
              </select>

              <div className="ref-chip-list">
                {refsForPdf.length === 0 ? (
                  <p className="chatpara" id="ref-view-placeholder">
                    -
                  </p>
                ) : (
                  refsForPdf.map((ref) => (
                    <span key={ref.chatId} className="ref-chip">
                      #{ref.chatNumber ?? '—'}
                      <button
                        className="ref-chip-remove"
                        onClick={() => handleRemoveReference(ref.chatId)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="chatinfo-ref-view">
              {refsForPdf.map((ref) => (
                <button
                  key={ref.chatId}
                  className="linklike"
                  onClick={() => openReferencedChat(ref.chatId)}
                  title={ref.title}
                >
                  #{ref.chatNumber ?? '—'}
                </button>
              ))}
            </div>
          )}
        </ChatInfoRow>
      ) : null}
      <ChatInfoRow label={lang === 'EN' ? 'Messages:' : 'Nachrichten:'}>
        <p className="chatpara">
          {selectedChat?.chatId ? messages.length : ''}
        </p>
      </ChatInfoRow>
      <ChatInfoRow label={lang === 'EN' ? 'Download:' : 'Herunterladen:'}>
        {selectedChat ? (
          <PDFDownloadLink
            key={`${selectedChat?.chatId}-${refsForPdf.length}-${messages.length}`}
            document={
              <ChatPdf
                chat={selectedChat}
                messages={messages}
                references={refsForPdf}
                lang={lang}
              />
            }
            fileName={`${
              selectedChat.chatNumber
                ? '#' + selectedChat.chatNumber + '_' + selectedChat.title
                : selectedChat.title
            }.pdf`}
            className="chatpara linklike"
            id="pdf-download-link"
          >
            <FileText size={18} strokeWidth={1.5} />
          </PDFDownloadLink>
        ) : (
          <span className="chatpara"></span>
        )}
      </ChatInfoRow>
      {isAuth && (
        <ChatInfoRow label="Chat-Id:">
          <p className="chatpara">{selectedChat?.chatId}</p>
        </ChatInfoRow>
      )}
      {isAuth && (
        <ChatInfoRow label={lang === 'EN' ? 'Comments:' : 'Kommentare:'}>
          <p className="chatpara">
            {selectedChat?.chatId ? commentsCount : ''}
          </p>
        </ChatInfoRow>
      )}
      <hr className="chatinfo-divider" />
      {!editMode && isAuth && (
        <div className="chatinfo-actions">
          <button
            className="chatinfo-buttons"
            onClick={() => setEditMode((prev) => !prev)}
            title="Edit/Cancel"
          >
            <PencilLine size={18} strokeWidth={1.5} />
          </button>
          <button
            className="chatinfo-buttons"
            onClick={handleClear}
            title="Clear"
          >
            <BrushCleaning size={18} strokeWidth={1.5} />
          </button>
          <button
            className="chatinfo-buttons"
            onClick={handleCreate}
            disabled={selectedChat !== null}
            title="New Chat"
          >
            <SquarePen size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}
      {editMode && isAuth && (
        <div className="chatinfo-actions">
          <button
            className="chatinfo-buttons"
            onClick={handleSave}
            title="Save"
          >
            <Save size={18} strokeWidth={1.5} />
          </button>
          <button
            className="chatinfo-buttons"
            onClick={() => setEditMode((prev) => !prev)}
            title="Cancel"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
          <button
            className="chatinfo-buttons"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}
      {isAuth ? (
        <div className="chatinfo-toggle">
          <button className="toggle-btn" onClick={() => navigate('/chatbox')}>
            Chatbox
          </button>
          <button
            className={`toggle-btn ${viewMode === 'drafts' ? 'active' : ''}`}
            onClick={() => setViewMode('drafts')}
          >
            {lang === 'EN' ? 'Drafts' : 'Entwürfe'}
          </button>
          <button
            className={`toggle-btn ${viewMode === 'comments' ? 'active' : ''}`}
            onClick={() => setViewMode('comments')}
          >
            {lang === 'EN' ? 'Comments' : 'Kommentare'}
          </button>
        </div>
      ) : null}
      {isAuth ? (
        <hr className="chatinfo-divider" />
      ) : (
        <p className="para-comment">
          {lang === 'EN' ? 'Comments' : 'Kommentare'} ({commentsCount})
        </p>
      )}
      {viewMode === 'drafts' && isAuth ? (
        <div className="chat-overview">
          <DraftListTable chats={drafts} />
        </div>
      ) : (
        <div className="chat-overview">
          <CommentBox />
        </div>
      )}
    </div>
  );
};

export default ChatInfo;
