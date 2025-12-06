import { AppDispatch, RootState } from './store';
import {
  AsyncThunkAction,
  PayloadAction,
  ThunkDispatch,
  UnknownAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import { Actor } from '../types/ActorStyles';
import { Message } from '../types/Message';
import { authedFetch } from '../api/authedFetch';

type MessagesState = {
  chatmessages: Message[];
  loading: boolean;
  error?: string | null;
  attachmentsByMessageId: Record<number, MessageAttachment[]>;
};

// === Attachment-Response vom Backend ===
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
  deleted?: boolean; // Achtung: Backend liefert "deleted", nicht "isDeleted"
};

const initialState: MessagesState = {
  chatmessages: [],
  loading: false,
  error: null,
  attachmentsByMessageId: {},
};

// get messages for selected chat
export const fetchMessagesForChat = createAsyncThunk<
  Message[],
  number,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'chats/fetchMessagesForChat',
  async (chatId, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/messages/chat/${chatId}`);
      if (!res.ok) throw new Error('Error loading messages');
      const data: Message[] = await res.json();
      dispatch(setMessages(data));
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Error loading messages');
    }
  }
);

// get all messages
export const fetchMessages = createAsyncThunk<Message[]>(
  'messages/fetch',
  async () => {
    const res = await fetch(`/api/messages`);
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
      const res = await authedFetch(dispatch, getState, `/api/messages`, {
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
        `/api/messages/${messageId}`,
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
  number,
  number,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/delete',
  async (messageId, { dispatch, getState, rejectWithValue }) => {
    const state = getState();
    const messages = state.messages.chatmessages;
    const messageToDelete = messages.find((m) => m.messageId === messageId);
    if (!messageToDelete) {
      return messageId;
    }

    await authedFetch(dispatch, getState, `/api/messages/${messageId}`, {
      method: 'DELETE',
    });

    const updatedMessages = messages
      .filter((m) => m.messageId !== messageId)
      .map((m) =>
        m.messageNumber > messageToDelete.messageNumber
          ? { ...m, messageNumber: m.messageNumber - 1 }
          : m
      )
      .sort((a, b) => a.messageNumber - b.messageNumber);

    dispatch(setMessages(updatedMessages));
    await dispatch(saveAllMessages(updatedMessages));

    return messageId;
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
        authedFetch(dispatch, getState, `/api/messages/${m.messageId}`, {
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
    const messages: Message[] = state.messages.chatmessages;

    let messagesChanged = false;

    const updatedMessages = messages.map((msg) => {
      // check if property has changed
      if (msg.messageId === messageId) {
        const messageChanged =
          msg.messageText !== updatedText ||
          msg.actor !== newActor ||
          msg.respId !== responseId ||
          msg.messageNumber !== newMessageNumber;

        // if it has changed update all properties except messagenumber
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

    // if messagenumber has changed
    if (oldMessageNumber !== newMessageNumber) {
      const sorted = updatedMessages
        .map((msg) => {
          // if oldnumber is bigger than newnumber check if number of iterated message is bigger or even newnumber
          // and number is smaller than oldnumber
          // e.g. change from number 7 to 3, iterate through messages and find the messages that go from 3 to max
          // 7, numbers below 3 or higher than 7 should not be sorted new, it is not necessary
          // but the numbers in between 3 to 7 should be sorted new and get new numbers
          // if 7 will be 3, than original 3 should become 4 and so on until message number 6 will become 7
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
        // in database they are not sorted by messagenumber, so they have to be sorted before providing
        .sort((a, b) => a.messageNumber - b.messageNumber);

      dispatch(setMessages(sorted));
      await dispatch(saveAllMessages(sorted));
    } else {
      dispatch(setMessages(updatedMessages));
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

// === Attachment-Types (nur fürs Frontend/POST) ===
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

// kleine Helper für bessere Fehlermeldungen
async function readError(res: Response) {
  const text = await res.text().catch(() => '');
  return `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`;
}

// === Einzelnes Attachment anlegen ===
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
        // JSON-POST wie bisher
        const body = {
          kind: 'external_url',
          href: attachment.href,
          title: attachment.title,
          sortOrder: attachment.sortOrder,
        };

        res = await authedFetch(
          dispatch,
          getState,
          `/api/messages/${messageId}/attachments`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
      } else {
        // FILE-Upload via multipart/form-data
        const formData = new FormData();
        formData.append('file', attachment.file);

        // Titel etc. könntest du später über PATCH setzen, wenn du willst.
        res = await authedFetch(
          dispatch,
          getState,
          `/api/messages/${messageId}/attachments/upload`,
          {
            method: 'POST',
            body: formData, // KEINE Content-Type-Header setzen, Browser macht das
          }
        );
      }

      if (!res.ok) {
        const errText = await readError(res);
        return rejectWithValue(errText);
      }

      // Attachments nachladen, damit die UI aktualisiert ist
      await dispatch(fetchAttachmentsForMessage(messageId));
    } catch (err: any) {
      const msg = err?.message || String(err);
      return rejectWithValue(msg);
    }
  }
);

// === Mehrere Attachments in einem Rutsch ===
export const createAttachmentsBulk = createAsyncThunk<
  void,
  { messageId: number; attachments: NewAttachment[] },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/createAttachmentsBulk',
  async ({ messageId, attachments }, { dispatch, rejectWithValue }) => {
    try {
      for (const a of attachments) {
        // unwrap() wirft bei Fehler -> catch greift
        await dispatch(createAttachment({ messageId, attachment: a })).unwrap();
      }
    } catch (err: any) {
      console.error('createAttachmentsBulk failed:', err);
      return rejectWithValue(err?.message || 'Error adding attachments');
    }
  }
);

// === Message + Attachments in einem Schritt (für neue Message) ===
export const createMessageWithAttachments = createAsyncThunk<
  Message,
  { message: Omit<Message, 'messageId'>; attachments?: NewAttachment[] },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'messages/createMessageWithAttachments',
  async ({ message, attachments = [] }, { dispatch, rejectWithValue }) => {
    try {
      // 1) Message anlegen
      const created = await dispatch(createMessage(message)).unwrap();

      // 2) Attachments (optional)
      if (attachments.length > 0) {
        await dispatch(
          createAttachmentsBulk({ messageId: created.messageId, attachments })
        ).unwrap();
        // Sicherheitshalber neu laden (wird schon im createAttachment gemacht, aber tut nicht weh):
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

// === Attachments für bestehende Message ===
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
        `/api/messages/${messageId}/attachments`
      );
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
        );
      }
      const data = (await res.json()) as MessageAttachment[];
      // nur nicht-gelöschte
      const filtered = data.filter((a) => !a.deleted);
      return { messageId, attachments: filtered };
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error loading attachments');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.chatmessages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.chatmessages.push(action.payload);
    },
    updateMessage(
      state,
      action: PayloadAction<{ messageId: number; changes: Partial<Message> }>
    ) {
      const idx = state.chatmessages.findIndex(
        (m) => m.messageId === action.payload.messageId
      );
      if (idx !== -1)
        state.chatmessages[idx] = {
          ...state.chatmessages[idx],
          ...action.payload.changes,
        };
    },
    removeMessage(state, action: PayloadAction<number>) {
      state.chatmessages = state.chatmessages.filter(
        (m) => m.messageId !== action.payload
      );
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
        state.chatmessages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error loading messages';
      })
      .addCase(fetchMessagesForChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesForChat.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchMessagesForChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error loading messages';
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.chatmessages.push(action.payload);
      })
      .addCase(deleteMessageThunk.fulfilled, (s, a) => {
        s.chatmessages = s.chatmessages.filter(
          (m) => m.messageId !== a.payload
        );
      })
      .addCase(saveAllMessages.fulfilled, (s, a) => {
        s.chatmessages = a.payload;
      })
      .addCase(patchMessage.fulfilled, (state, action) => {
        const idx = state.chatmessages.findIndex(
          (m) => m.messageId === action.payload.messageId
        );
        if (idx !== -1) {
          state.chatmessages[idx] = {
            ...state.chatmessages[idx],
            ...action.payload,
          };
        }
      })
      .addCase(fetchAttachmentsForMessage.fulfilled, (state, action) => {
        const { messageId, attachments } = action.payload;
        state.attachmentsByMessageId[messageId] = attachments;
      });
  },
});

export const { setMessages, addMessage, updateMessage, removeMessage } =
  messagesSlice.actions;
export default messagesSlice.reducer;
