import './ChatInfo.css';

import { AppDispatch, RootState } from '../../store/store';
import { Chat, Language, Status, statusMap } from '../../types/Chats';
import { LanguageCode, languageMap } from '../../constants/language';
import React, { useEffect, useState } from 'react';
import {
  createChat,
  deleteChatThunk,
  saveSingleChat,
  setSelectedChat,
} from '../../store/chatsSclice';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMessagesForChat } from '../../store/messagesSlice';

const ChatInfo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector(
    (state: RootState) => state.chats.selectedChat
  );
  const messages = useSelector(
    (state: RootState) => state.messages.chatmessages
  );

  const [editMode, setEditMode] = useState(false);
  const [chatForm, setChatForm] = useState<Partial<Chat>>({});

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE');
  };

  const handleChange = (field: keyof Chat, value: any) => {
    setChatForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    if (!chatForm || !selectedChat) return;
    await dispatch(
      saveSingleChat({
        chatId: selectedChat.chatId,
        updates: { ...chatForm, chatNumber: null },
      })
    );
    setEditMode(false);
  };

  const handlePublish = async () => {
    if (!chatForm || !selectedChat) return;
    await dispatch(
      saveSingleChat({
        chatId: selectedChat.chatId,
        updates: { ...chatForm, chatNumber: selectedChat.chatNumber ?? 999 },
      })
    );
    setEditMode(false);
  };

  const handleDelete = async () => {
    if (!selectedChat?.chatId) return;
    await dispatch(deleteChatThunk(selectedChat.chatId));
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
      dispatch(setSelectedChat(result.payload));
      setChatForm(result.payload);
      setEditMode(true);
    }
  };

  useEffect(() => {
    if (selectedChat && !editMode) {
      dispatch(fetchMessagesForChat(selectedChat.chatId));
      setChatForm(selectedChat);
    }
  }, [selectedChat, editMode]);

  if (!selectedChat && !editMode) {
    return <div>Lade Chat...</div>;
  }

  return (
    <div>
      <div className="chatinfo">
        <p className="chatpara">Chatnumber:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.chatNumber ?? selectedChat?.chatNumber ?? ''}
            onChange={(e) => handleChange('chatNumber', e.target.value)}
          />
        ) : (
          <p className="chatpara">
            {chatForm.chatNumber ?? selectedChat?.chatNumber ?? ''}
          </p>
        )}
      </div>
      <div className="chatinfo">
        <p className="chatpara">Title:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.title ?? selectedChat?.title ?? ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        ) : (
          <p className="chatpara">
            {chatForm.title ?? selectedChat?.title ?? ''}
          </p>
        )}
      </div>
      <div className="chatinfo">
        <p className="chatpara">Description:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.description ?? selectedChat?.description ?? ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        ) : (
          <p className="chatpara">
            {chatForm.description ?? selectedChat?.description ?? ''}
          </p>
        )}
      </div>
      <div className="chatinfo">
        <p className="chatpara">Tags:</p>
        {editMode ? (
          <input
            className="chatinfo-input"
            type="text"
            value={chatForm.tags ?? selectedChat?.tags ?? ''}
            onChange={(e) => handleChange('tags', e.target.value)}
          />
        ) : (
          <p className="chatpara">
            {chatForm.tags ?? selectedChat?.tags ?? ''}
          </p>
        )}
      </div>
      {editMode ? (
        <div className="chatinfo">
          <p className="chatpara">Messages:</p>
          <p className="chatpara">{messages.length}</p>
        </div>
      ) : null}
      <div className="chatinfo">
        <p className="chatpara">Status:</p>
        {editMode ? (
          <select
            className="chatinfo-input"
            value={chatForm.status ?? selectedChat?.status ?? ''}
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
          <p className="chatpara">
            {chatForm.status ?? selectedChat?.status ?? ''}
          </p>
        )}
      </div>
      <div className="chatinfo">
        <p className="chatpara">Language:</p>
        {editMode ? (
          <select
            className="chatinfo-input"
            value={chatForm.language ?? selectedChat?.language ?? 'DE'}
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
            {selectedChat?.language
              ? languageMap[chatForm.language as LanguageCode] ||
                selectedChat.language
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
        <button className="chatinfo-buttons" onClick={handleSaveDraft}>
          Save Draft
        </button>
        <button className="chatinfo-buttons" onClick={handlePublish}>
          Publish
        </button>
        <button className="chatinfo-buttons" onClick={handleCreate}>
          Create Chat
        </button>
        <button className="chatinfo-buttons" onClick={handleDelete}>
          Delete
        </button>
        <button
          className="chatinfo-buttons"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>
    </div>
  );
};

export default ChatInfo;
