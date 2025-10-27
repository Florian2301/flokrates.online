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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE');
  };

  const handleChange = (field: keyof Chat, value: any) => {
    setChatForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!chatForm.chatId) return;
    const result = await dispatch(
      saveSingleChat({
        chatId: chatForm.chatId,
        updates: { ...chatForm, chatNumber: chatForm.chatNumber },
      })
    );

    if (saveSingleChat.fulfilled.match(result)) {
      setEditMode(false);
      dispatch(setSelectedChat(result.payload));
      setChatForm(result.payload);
    }
  };

  const handlePublish = async () => {
    if (!chatForm.chatId) return;

    const result = await dispatch(
      saveSingleChat({
        chatId: chatForm.chatId,
        updates: {
          ...chatForm,
          chatNumber:
            chatForm.chatNumber === 0 ? maxChatNumber + 1 : chatForm.chatNumber,
          status: 'PUB' as Status,
        },
      })
    );

    if (saveSingleChat.fulfilled.match(result)) {
      setEditMode(false);
      dispatch(setSelectedChat(result.payload));
      setChatForm(result.payload);
    }
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
