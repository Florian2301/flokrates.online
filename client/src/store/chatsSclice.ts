import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Chat } from '../types/Chats';
import { Message } from '../types/Message';
import { setMessages } from './messagesSlice';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

type ChatsState = {
  items: Chat[];
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;
};

const initialState: ChatsState = {
  items: [],
  selectedChat: localStorage.getItem('selectedChat')
    ? JSON.parse(localStorage.getItem('selectedChat')!)
    : null,
  loading: false,
  error: null,
};

// get messages for selected chat
export const fetchMessagesForChat = createAsyncThunk<
  Message[],
  number,
  { rejectValue: string }
>(
  'chats/fetchMessagesForChat',
  async (chatId, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/chat/${chatId}`);
      if (!res.ok) throw new Error('Fehler beim Laden der Nachrichten');
      const data: Message[] = await res.json();
      dispatch(setMessages(data));
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Fehler beim Laden der Nachrichten');
    }
  }
);

// get all chats
export const fetchChats = createAsyncThunk<
  Chat[],
  void,
  { rejectValue: string }
>('chats/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chats`);
    if (!res.ok) throw new Error('Fehler beim Laden der Chats');
    const data: Chat[] = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Fehler beim Laden der Chats');
  }
});

// create chat
export const createChat = createAsyncThunk<
  Chat,
  Omit<Chat, 'chatId'>,
  { rejectValue: string }
>('chats/createChat', async (newChat, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChat),
    });

    if (!res.ok) throw new Error('Fehler beim Erstellen des Chats');
    const data: Chat = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Fehler beim Erstellen des Chats');
  }
});

// delete chat
export const deleteChatThunk = createAsyncThunk<
  number, // Feedback from Server (could also be boolean)
  number, // chatId as parameter (dispatch(deleteChatThink(3)))
  { rejectValue: string }
>('chats/deleteChat', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Fehler beim Löschen des Chats');
    return chatId;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Fehler beim Löschen des Chats');
  }
});

// patch chat
export const patchChat = createAsyncThunk<
  Chat,
  { chatId: number; updates: Partial<Chat> },
  { rejectValue: string }
>('chats/patchChat', async ({ chatId, updates }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Fehler beim Patchen des Chats');
    const updatedChat: Chat = await res.json();
    return updatedChat;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Fehler beim Patchen des Chats');
  }
});

// put chat
export const putChat = createAsyncThunk<Chat, Chat, { rejectValue: string }>(
  'chats/putChat',
  async (chat, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chat.chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chat),
      });
      if (!res.ok) throw new Error('Fehler beim Aktualisieren (PUT)');
      const updatedChat: Chat = await res.json();
      return updatedChat;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Fehler beim Aktualisieren (PUT)');
    }
  }
);

export const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setSelectedChat(state, action: PayloadAction<Chat | null>) {
      state.selectedChat = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedChat', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('selectedChat');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unbekannter Fehler';
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
        state.error = action.payload || 'Fehler beim Laden der Nachrichten';
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteChatThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.chatId !== action.payload);
      })
      .addCase(patchChat.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (c) => c.chatId === action.payload.chatId
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
      })
      .addCase(putChat.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (c) => c.chatId === action.payload.chatId
        );
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      });
  },
});

export const { setSelectedChat } = chatsSlice.actions;
export default chatsSlice.reducer;
