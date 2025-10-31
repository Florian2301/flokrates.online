import './ChatInfo.css';

import { AppDispatch, RootState } from '../../store/store';
import { Chat, Language, Status, statusMap } from '../../types/Chats';
import { LanguageCode, languageMap } from '../../constants/language';
import React, { useEffect, useState } from 'react';
import {
  createChat,
  deleteChatThunk,
  fetchChats,
  saveSingleChat,
  setSelectedChat,
} from '../../store/chatsSclice';
import {
  deleteReference,
  fetchRefsByChat,
  selectRefsByChat,
  selectRefsLoading,
  upsertReference,
} from '../../store/networksSclice';
import { fetchMessagesForChat, setMessages } from '../../store/messagesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { DraftListTable } from './DraftListTable';

const ChatInfo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );
  const messages = useSelector(
    (state: RootState) => state.messages.chatmessages
  );
  const chats = useSelector((state: RootState) => state.chats.chats);
  const drafts = chats.filter((c) => c.status !== 'PUB');
  const maxChatNumber = chats.reduce((max, c) => {
    return c.chatNumber !== null && c.chatNumber > max ? c.chatNumber : max;
  }, 0);
  const [editMode, setEditMode] = useState(false);
  const [chatForm, setChatForm] = useState<Partial<Chat>>({});
  const publishedChats = chats.filter(
    (c) => c.status === 'PUB' && c.chatId !== chatForm?.chatId
  );

  const chatId = chatForm.chatId ?? selectedChat?.chatId ?? null;

  // Refs aus networks-Slice
  const refs = useSelector((state: RootState) =>
    chatId ? selectRefsByChat(state, chatId) : []
  );
  /** IDs der referenzierten Chats */
  const currentRefIds = refs.map((n) => n.refId);

  // (optional) Loading-Flag, falls du es anzeigen willst
  const refsLoading = useSelector((state: RootState) =>
    chatId ? selectRefsLoading(state, chatId) : false
  );

  const chatById = (id: number) => chats.find((c) => c.chatId === id);

  const currentRefs: number[] = Array.isArray(chatForm.referencedChatIds)
    ? chatForm.referencedChatIds!
    : [];

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE');
  };

  const handleChange = (field: keyof Chat, value: any) => {
    setChatForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
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
    /*
    if (saveSingleChat.fulfilled.match(result)) {
      setEditMode(false);
      dispatch(setSelectedChat(result.payload));
      setChatForm(result.payload);
    }*/
  };

  const handlePublish = async () => {
    if (!chatForm.chatId) return;
    const payloadRefs = Array.isArray(chatForm.referencedChatIds)
      ? chatForm.referencedChatIds
      : [];

    const result = await dispatch(
      saveSingleChat({
        chatId: chatForm.chatId,
        updates: {
          ...chatForm,
          chatNumber:
            chatForm.chatNumber === 0 ? maxChatNumber + 1 : chatForm.chatNumber,
          status: 'PUB' as Status,
          referencedChatIds: payloadRefs,
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
    /*
    if (saveSingleChat.fulfilled.match(result)) {
      setEditMode(false);
      dispatch(setSelectedChat(result.payload));
      setChatForm(result.payload);
    }*/
  };

  const handleDelete = async () => {
    if (!chatForm?.chatId) return;
    const result = await dispatch(deleteChatThunk(chatForm.chatId));
    if (deleteChatThunk.fulfilled.match(result)) {
      handleClear();
    }
  };

  const handleCreate = async () => {
    const newChatData: Omit<Chat, 'chatId'> = {
      title: 'draft',
      description: '',
      tags: '',
      language: 'DE' as Language,
      chatNumber: null,
      status: 'DRA' as Status,
      authorId: 1,
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

  const handleClear = () => {
    setChatForm({});
    dispatch(setMessages([]));
    dispatch(setSelectedChat(null));
    setEditMode(false);
  };

  useEffect(() => {
    if (selectedChat) {
      setChatForm(selectedChat);
      dispatch(fetchMessagesForChat(selectedChat.chatId));
    } else {
      setChatForm({});
    }
  }, [selectedChat, dispatch]);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchRefsByChat(chatId));
    }
  }, [dispatch, chatId]);

  // References
  const handleAddReference = (refId: number) => {
    if (!chatId || !refId) return;
    if (currentRefIds.includes(refId)) return;
    dispatch(upsertReference({ chatId, refId }));
  };

  const handleRemoveReference = (refId: number) => {
    if (!chatId) return;
    dispatch(deleteReference({ chatId, refId }));
  };

  // Im Nicht-Edit-Mode: klick auf Referenz öffnet diesen Chat
  const openReferencedChat = (chatId: number) => {
    const target = chats.find((c) => c.chatId === chatId);
    if (!target) return;
    dispatch(setSelectedChat(target));
    dispatch(fetchMessagesForChat(target.chatId));
  };

  return (
    <div>
      <div className="chatinfo">
        <p className="chatpara">Chatnumber:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.chatNumber ?? undefined}
            onChange={(e) =>
              handleChange('chatNumber', parseInt(e.target.value) || 0)
            }
          />
        ) : (
          <p className="chatpara">{chatForm.chatNumber ?? ''}</p>
        )}
      </div>
      <div className="chatinfo">
        <p className="chatpara">Title:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.title ?? ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        ) : (
          <p className="chatpara">{chatForm.title ?? ''}</p>
        )}
      </div>
      <div className="chatinfo">
        <p className="chatpara">Description:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.description ?? ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        ) : (
          <p className="chatpara">{chatForm.description ?? ''}</p>
        )}
      </div>
      <div className="chatinfo">
        <p className="chatpara">Tags:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.tags ?? ''}
            onChange={(e) => handleChange('tags', e.target.value)}
          />
        ) : (
          <p className="chatpara">{chatForm.tags ?? ''}</p>
        )}
      </div>
      {/* REFERENZEN */}
      <div className="chatinfo">
        <p className="chatpara">Referenzen:</p>

        {editMode ? (
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

            {/* Ausgewählte Referenzen als Chips mit Entfernen */}
            <div className="ref-chip-list">
              {currentRefIds.length === 0
                ? null
                : currentRefIds.map((id) => {
                    const ref = chatById(id);
                    if (!ref) return null;
                    return (
                      <span key={id} className="ref-chip">
                        #{ref.chatNumber ?? '—'}
                        <button
                          className="ref-chip-remove"
                          onClick={() => handleRemoveReference(id)}
                          title="Entfernen"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
            </div>
          </div>
        ) : (
          <div className="chatinfo-ref-view">
            {currentRefIds.length === 0 ? (
              <p className="chatpara">–</p>
            ) : (
              currentRefIds.map((id) => {
                const ref = chatById(id);
                if (!ref) return null;
                return (
                  <button
                    key={id}
                    className="linklike"
                    onClick={() => openReferencedChat(id)}
                    title={ref.title}
                  >
                    #{ref.chatNumber ?? '—'}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="chatinfo">
        <p className="chatpara">Messages:</p>
        <p className="chatpara">{messages.length}</p>
      </div>
      <div className="chatinfo">
        <p className="chatpara">Status:</p>
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
      </div>
      <div className="chatinfo">
        <p className="chatpara">Language:</p>
        {editMode ? (
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
      </div>
      {editMode ? (
        <div className="chatinfo">
          <p className="chatpara">Created:</p>
          <p className="chatpara">
            {chatForm.dateCreated ? formatDate(chatForm.dateCreated) : ''}
          </p>
        </div>
      ) : null}
      {editMode ? (
        <div className="chatinfo">
          <p className="chatpara">Modified:</p>
          <p className="chatpara">
            {chatForm.dateModified ? formatDate(chatForm.dateModified) : ''}
          </p>
        </div>
      ) : null}
      {chatForm.datePublished ? (
        <div className="chatinfo">
          <p className="chatpara">Published:</p>
          <p className="chatpara">
            {chatForm.datePublished ? formatDate(chatForm.datePublished) : ''}
          </p>
        </div>
      ) : null}
      <div className="chatinfo">
        <p className="chatpara">Download:</p>
        <a className="chatpara">Link</a>
      </div>

      <hr className="chatinfo-divider" />

      <div className="chatinfo-actions">
        <button
          className="chatinfo-buttons"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
        <button className="chatinfo-buttons" onClick={handleClear}>
          Clear
        </button>
        <button className="chatinfo-buttons" onClick={handleCreate}>
          Create
        </button>
      </div>
      <div className="chatinfo-actions">
        <button className="chatinfo-buttons" onClick={handleSave}>
          Save
        </button>
        <button
          className="chatinfo-buttons"
          onClick={handlePublish}
          disabled={!editMode}
        >
          Publish
        </button>
        <button
          className="chatinfo-buttons"
          onClick={handleDelete}
          disabled={!editMode}
        >
          Delete
        </button>
      </div>
      <div className="chat-overview">
        <DraftListTable chats={drafts} messages={messages} />
      </div>
    </div>
  );
};

export default ChatInfo;
