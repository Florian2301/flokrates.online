// src/store/messagesSlice.ts

import { AppDispatch, RootState } from './store';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Actor } from '../types/ActorStyles';
import { Message } from '../types/Message';
import { apiUrl } from '../config';
import { authedFetch } from '../api/authedFetch';

// Attachment-Response Backend
export type MessageAttachment = {
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

type MessagesState = {
  byChatId: Record<number, Message[]>;
  loading: boolean;
  loadingByChatId: Record<number, boolean>;
  error?: string | null;
  attachmentsByMessageId: Record<number, MessageAttachment[]>;
};

const initialState: MessagesState = {
  byChatId: {},
  loading: false,
  loadingByChatId: {},
  error: null,
  attachmentsByMessageId: {},
};

const sortByMessageNumber = (list: Message[]) =>
  [...list].sort((a, b) => a.messageNumber - b.messageNumber);

// get messages for selected chat
export const fetchMessagesForChat = createAsyncThunk<
  { chatId: number; messages: Message[] },
  number,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('messages/fetchMessagesForChat', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl(`/messages/chat/${chatId}`));
    if (!res.ok) throw new Error('Error loading messages');
    const data: Message[] = await res.json();
    return { chatId, messages: data };
  } catch (err) {
    console.error(err);
    return rejectWithValue('Error loading messages');
  }
});

// get all messages
export const fetchMessages = createAsyncThunk<Message[]>(
  'messages/fetch',
  async () => {
    const res = await fetch(apiUrl(`/messages`));
    const data = await res.json();
    return data as Message[];
  }
);

// create message
export const createMessage = createAsyncThunk<
  Message,
  Omit<Message, 'messageId'>,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/createMessage',
  async (newMessage, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(dispatch, getState, `/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error('Error creating message');
      const created = await res.json();
      return created as Message;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Error creating message');
    }
  }
);

// patch message
export const patchMessage = createAsyncThunk<
  Message,
  { messageId: number; updates: Partial<Message> },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/patchMessage',
  async ({ messageId, updates }, { dispatch, getState, rejectWithValue }) => {
    try {
      const { messageNumber, respId, actor, messageText } = updates;
      const body: Partial<Message> = {
        ...(messageNumber !== undefined ? { messageNumber } : {}),
        ...(respId !== undefined ? { respId } : {}),
        ...(actor !== undefined ? { actor } : {}),
        ...(messageText !== undefined ? { messageText } : {}),
      };

      const res = await authedFetch(
        dispatch,
        getState,
        `/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error('Error patching message');
      return (await res.json()) as Message;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Error patching message');
    }
  }
);

// delete message
export const deleteMessageThunk = createAsyncThunk<
  { chatId: number; messageId: number },
  number,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/delete',
  async (messageId, { dispatch, getState, rejectWithValue }) => {
    const state = getState();

    // find Chat + Messages
    let chatId: number | null = null;
    let messages: Message[] = [];
    for (const [key, list] of Object.entries(state.messages.byChatId)) {
      const found = list.find((m) => m.messageId === messageId);
      if (found) {
        chatId = Number(key);
        messages = list;
        break;
      }
    }
    if (chatId == null) {
      return rejectWithValue('Message not found in state');
    }

    const messageToDelete = messages.find((m) => m.messageId === messageId);
    if (!messageToDelete) {
      return { chatId, messageId };
    }

    const res = await authedFetch(
      dispatch,
      getState,
      `/messages/${messageId}`,
      {
        method: 'DELETE',
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
      );
    }

    const updatedMessages = messages
      .filter((m) => m.messageId !== messageId)
      .map((m) =>
        m.messageNumber > messageToDelete.messageNumber
          ? { ...m, messageNumber: m.messageNumber - 1 }
          : m
      )
      .sort((a, b) => a.messageNumber - b.messageNumber);

    dispatch(
      setMessagesForChat({
        chatId,
        messages: updatedMessages,
      })
    );
    await dispatch(saveAllMessages(updatedMessages));

    return { chatId, messageId };
  }
);

// save all messages
export const saveAllMessages = createAsyncThunk<
  Message[],
  Message[],
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('messages/saveAll', async (msgs, { dispatch, getState, rejectWithValue }) => {
  try {
    await Promise.all(
      msgs.map((m) =>
        authedFetch(dispatch, getState, `/messages/${m.messageId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            messageText: m.messageText,
            actor: m.actor,
            messageNumber: m.messageNumber,
            respId: m.respId,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error(`PATCH ${m.messageId} -> ${res.status}`);
        })
      )
    );
    return msgs;
  } catch (e) {
    console.error(e);
    return rejectWithValue('Error saving messages');
  }
});

// check if messages has changed and sort if messagenumber has changed
export const changeMessage = createAsyncThunk<
  void,
  {
    messageId: number;
    updatedText: string;
    newActor: Actor;
    newMessageNumber: number;
    oldMessageNumber: number;
    responseId: number | null;
  },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/changeMessage',
  async (
    {
      messageId,
      updatedText,
      newActor,
      newMessageNumber,
      oldMessageNumber,
      responseId,
    },
    { dispatch, getState }
  ) => {
    const state = getState();

    // find Chat + Messages
    let chatId: number | null = null;
    let messages: Message[] = [];
    for (const [key, list] of Object.entries(state.messages.byChatId)) {
      if (list.some((m) => m.messageId === messageId)) {
        chatId = Number(key);
        messages = list;
        break;
      }
    }
    if (chatId == null) return;

    let messagesChanged = false;

    const updatedMessages = messages.map((msg) => {
      if (msg.messageId === messageId) {
        const messageChanged =
          msg.messageText !== updatedText ||
          msg.actor !== newActor ||
          msg.respId !== responseId ||
          msg.messageNumber !== newMessageNumber;

        if (messageChanged) {
          messagesChanged = true;
          return {
            ...msg,
            messageText:
              msg.messageText !== updatedText ? updatedText : msg.messageText,
            actor: msg.actor !== newActor ? newActor : msg.actor,
            respId: msg.respId !== responseId ? responseId : msg.respId,
          };
        }
      }
      return msg;
    });

    if (!messagesChanged) return;

    if (oldMessageNumber !== newMessageNumber) {
      const sorted = updatedMessages
        .map((msg) => {
          if (oldMessageNumber > newMessageNumber) {
            if (
              msg.messageNumber >= newMessageNumber &&
              msg.messageNumber < oldMessageNumber
            ) {
              return { ...msg, messageNumber: msg.messageNumber + 1 };
            }
          }

          if (oldMessageNumber < newMessageNumber) {
            if (
              msg.messageNumber <= newMessageNumber &&
              msg.messageNumber > oldMessageNumber
            ) {
              return { ...msg, messageNumber: msg.messageNumber - 1 };
            }
          }
          return msg;
        })
        .map((msg) =>
          msg.messageId === messageId
            ? { ...msg, messageNumber: newMessageNumber }
            : msg
        )
        .sort((a, b) => a.messageNumber - b.messageNumber);

      dispatch(
        setMessagesForChat({
          chatId,
          messages: sorted,
        })
      );
      await dispatch(saveAllMessages(sorted));
    } else {
      dispatch(
        setMessagesForChat({
          chatId,
          messages: updatedMessages,
        })
      );
      await dispatch(
        patchMessage({
          messageId,
          updates: {
            messageNumber: oldMessageNumber,
            respId: responseId,
            actor: newActor,
            messageText: updatedText,
          },
        })
      ).unwrap();
    }
  }
);

// Attachment-Types
export type NewAttachment =
  | {
      kind: 'external_url';
      href: string;
      title?: string | null;
      sortOrder?: number;
    }
  | {
      kind: 'file';
      file: File;
      title?: string | null;
      sortOrder?: number;
    };

async function readError(res: Response) {
  const text = await res.text().catch(() => '');
  return `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`;
}
export const createAttachment = createAsyncThunk<
  void,
  { messageId: number; attachment: NewAttachment },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/createAttachment',
  async (
    { messageId, attachment },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      let res: Response;

      if (attachment.kind === 'external_url') {
        const body = {
          kind: 'external_url',
          href: attachment.href,
          title: attachment.title,
          sortOrder: attachment.sortOrder,
        };

        res = await authedFetch(
          dispatch,
          getState,
          `/messages/${messageId}/attachments`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
      } else {
        const formData = new FormData();
        formData.append('file', attachment.file);

        res = await authedFetch(
          dispatch,
          getState,
          `/messages/${messageId}/attachments/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
      }

      if (!res.ok) {
        const errText = await readError(res);
        return rejectWithValue(errText);
      }

      await dispatch(fetchAttachmentsForMessage(messageId));
    } catch (err: any) {
      const msg = err?.message || String(err);
      return rejectWithValue(msg);
    }
  }
);

export const createAttachmentsBulk = createAsyncThunk<
  void,
  { messageId: number; attachments: NewAttachment[] },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/createAttachmentsBulk',
  async ({ messageId, attachments }, { dispatch, rejectWithValue }) => {
    try {
      for (const a of attachments) {
        await dispatch(createAttachment({ messageId, attachment: a })).unwrap();
      }
    } catch (err: any) {
      console.error('createAttachmentsBulk failed:', err);
      return rejectWithValue(err?.message || 'Error adding attachments');
    }
  }
);

export const createMessageWithAttachments = createAsyncThunk<
  Message,
  { message: Omit<Message, 'messageId'>; attachments?: NewAttachment[] },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/createMessageWithAttachments',
  async ({ message, attachments = [] }, { dispatch, rejectWithValue }) => {
    try {
      const created = await dispatch(createMessage(message)).unwrap();

      if (attachments.length > 0) {
        await dispatch(
          createAttachmentsBulk({ messageId: created.messageId, attachments })
        ).unwrap();
        await dispatch(fetchAttachmentsForMessage(created.messageId));
      }

      return created;
    } catch (err: any) {
      return rejectWithValue(
        err?.message || 'Error creating message with attachments'
      );
    }
  }
);

export const addAttachmentsToExistingMessage = createAsyncThunk<
  void,
  { messageId: number; attachments: NewAttachment[] },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/addAttachmentsToExistingMessage',
  async ({ messageId, attachments }, { dispatch, rejectWithValue }) => {
    try {
      if (!attachments.length) return;
      await dispatch(
        createAttachmentsBulk({ messageId, attachments })
      ).unwrap();
      await dispatch(fetchAttachmentsForMessage(messageId));
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error adding attachments');
    }
  }
);

export const fetchAttachmentsForMessage = createAsyncThunk<
  { messageId: number; attachments: MessageAttachment[] },
  number,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/fetchAttachmentsForMessage',
  async (messageId, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await authedFetch(
        dispatch,
        getState,
        `/messages/${messageId}/attachments`
      );
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
        );
      }
      const data = (await res.json()) as MessageAttachment[];
      const filtered = data.filter((a) => !a.deleted);
      return { messageId, attachments: filtered };
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error loading attachments');
    }
  }
);

export const deleteAttachment = createAsyncThunk<
  { messageId: number; attachmentId: number },
  { messageId: number; attachmentId: number },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/deleteAttachment',
  async (
    { messageId, attachmentId },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const res = await authedFetch(
        dispatch,
        getState,
        `/messages/${messageId}/attachments/${attachmentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok && res.status !== 404) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
        );
      }

      await dispatch(fetchAttachmentsForMessage(messageId));
      return { messageId, attachmentId };
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error deleting attachment');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessagesForChat(
      state,
      action: PayloadAction<{ chatId: number; messages: Message[] }>
    ) {
      const { chatId, messages } = action.payload;
      state.byChatId[chatId] = sortByMessageNumber(messages);
    },
    addMessage(state, action: PayloadAction<Message>) {
      const m = action.payload;
      if (m.chatId == null) return;
      const list = state.byChatId[m.chatId] ?? [];
      state.byChatId[m.chatId] = sortByMessageNumber([...list, m]);
    },
    updateMessage(
      state,
      action: PayloadAction<{ messageId: number; changes: Partial<Message> }>
    ) {
      const { messageId, changes } = action.payload;
      for (const [key, list] of Object.entries(state.byChatId)) {
        const idx = list.findIndex((m) => m.messageId === messageId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...changes };
          state.byChatId[Number(key)] = sortByMessageNumber(list);
          break;
        }
      }
    },
    removeMessage(state, action: PayloadAction<number>) {
      const messageId = action.payload;
      for (const [key, list] of Object.entries(state.byChatId)) {
        if (list.some((m) => m.messageId === messageId)) {
          state.byChatId[Number(key)] = list.filter(
            (m) => m.messageId !== messageId
          );
          break;
        }
      }
    },
    clearMessagesForChat(state, action: PayloadAction<number>) {
      const chatId = action.payload;
      delete state.byChatId[chatId];
      delete state.loadingByChatId[chatId];
    },
    clearAllMessages(state) {
      state.byChatId = {};
      state.loadingByChatId = {};
      state.attachmentsByMessageId = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const grouped: Record<number, Message[]> = {};
        action.payload.forEach((m) => {
          if (m.chatId == null) return;
          if (!grouped[m.chatId]) grouped[m.chatId] = [];
          grouped[m.chatId].push(m);
        });
        Object.entries(grouped).forEach(([chatIdStr, list]) => {
          const chatId = Number(chatIdStr);
          state.byChatId[chatId] = sortByMessageNumber(list);
        });
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error loading messages';
      })
      .addCase(fetchMessagesForChat.pending, (state, action) => {
        const chatId = action.meta.arg;
        state.loadingByChatId[chatId] = true;
        state.error = null;
      })
      .addCase(fetchMessagesForChat.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.loadingByChatId[chatId] = false;
        state.byChatId[chatId] = sortByMessageNumber(messages);
      })
      .addCase(fetchMessagesForChat.rejected, (state, action) => {
        const chatId = action.meta.arg;
        state.loadingByChatId[chatId] = false;
        state.error = action.payload || 'Error loading messages';
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        const m = action.payload;
        if (m.chatId == null) return;
        const list = state.byChatId[m.chatId] ?? [];
        state.byChatId[m.chatId] = sortByMessageNumber([...list, m]);
      })
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        delete state.attachmentsByMessageId[messageId];
      })
      .addCase(saveAllMessages.fulfilled, (state, action) => {
        const grouped: Record<number, Message[]> = {};
        action.payload.forEach((m) => {
          if (m.chatId == null) return;
          if (!grouped[m.chatId]) grouped[m.chatId] = [];
          grouped[m.chatId].push(m);
        });
        Object.entries(grouped).forEach(([chatIdStr, list]) => {
          const chatId = Number(chatIdStr);
          state.byChatId[chatId] = sortByMessageNumber(list);
        });
      })
      .addCase(patchMessage.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated.chatId == null) return;
        const list = state.byChatId[updated.chatId] ?? [];
        const idx = list.findIndex((m) => m.messageId === updated.messageId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated };
          state.byChatId[updated.chatId] = sortByMessageNumber(list);
        }
      })
      .addCase(fetchAttachmentsForMessage.fulfilled, (state, action) => {
        const { messageId, attachments } = action.payload;
        state.attachmentsByMessageId[messageId] = attachments;
      })
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        const { messageId, attachmentId } = action.payload;
        const list = state.attachmentsByMessageId[messageId];
        if (list) {
          state.attachmentsByMessageId[messageId] = list.filter(
            (a) => a.attachmentId !== attachmentId
          );
        }
      });
  },
});

export const {
  setMessagesForChat,
  addMessage,
  updateMessage,
  removeMessage,
  clearMessagesForChat,
  clearAllMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;

export const selectMessagesForChat = (
  state: RootState,
  chatId: number | null
) => (chatId != null ? (state.messages.byChatId[chatId] ?? []) : []);

export const selectAttachmentsForMessage = (
  state: RootState,
  messageId: number
) => state.messages.attachmentsByMessageId[messageId] ?? [];
