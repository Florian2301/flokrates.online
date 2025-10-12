import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Chat } from '../types/Chats';
import { RootState } from './store';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

type ChatsState = {
  chats: Chat[];
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;
};

const initialState: ChatsState = {
  chats: [],
  selectedChat: localStorage.getItem('selectedChat')
    ? JSON.parse(localStorage.getItem('selectedChat')!)
    : null,
  loading: false,
  error: null,
};

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

export const saveSingleChat = createAsyncThunk<
  Chat,
  { chatId: number; updates: Partial<Chat> },
  { rejectValue: string }
>('chats/saveSingle', async ({ chatId, updates }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/chats/${chatId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error('Fehler beim Speichern des Chats');
    const updated = await res.json();
    return updated as Chat;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Fehler beim Speichern des Chats');
  }
});

export const saveAllChats = createAsyncThunk(
  'chats/saveAll',
  async (chats: Chat[]) => {
    await Promise.all(
      chats.map((chat) =>
        fetch(`${process.env.API_BASE_URL}/api/chats/${chat.chatId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chat),
        })
      )
    );
    return chats;
  }
);

// delete chat
export const deleteDraftThunk = createAsyncThunk<
  number, // Feedback from Server (could also be boolean)
  number, // chatId as parameter (dispatch(deleteChatThink(3)))
  { rejectValue: string }
>('chats/deleteDraft', async (chatId, { rejectWithValue }) => {
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

export const deleteChatThunk = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: string }
>(
  'chats/deleteChat',
  async (chatId, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const chats = state.chats.chats;
      const chatToDelete = chats.find((c) => c.chatId === chatId);
      if (!chatToDelete) return chatId;

      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Fehler beim Löschen des Chats');

      const updatedChats = chats
        .filter((c) => c.chatId !== chatId)
        .map((c) =>
          c.chatNumber > chatToDelete.chatNumber
            ? { ...c, chatNumber: c.chatNumber - 1 }
            : c
        )
        .sort((a, b) => a.chatNumber - b.chatNumber);

      dispatch(setChats(updatedChats));

      await dispatch(saveAllChats(updatedChats));

      return chatId;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Fehler beim Löschen des Chats');
    }
  }
);

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

export const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<Chat[]>) {
      state.chats = action.payload;
    },
    setSelectedChat(state, action: PayloadAction<Chat | null>) {
      state.selectedChat = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedChat', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('selectedChat');
      }
    },
    addChat(state, action: PayloadAction<Chat>) {
      state.chats.push(action.payload);
    },
    updateChat(
      state,
      action: PayloadAction<{ chatId: number; changes: Partial<Chat> }>
    ) {
      const idx = state.chats.findIndex(
        (c) => c.chatId === action.payload.chatId
      );
      if (idx !== -1) {
        state.chats[idx] = {
          ...state.chats[idx],
          ...action.payload.changes,
        };
      }
    },
    removeChat(state, action: PayloadAction<number>) {
      state.chats = state.chats.filter((c) => c.chatId !== action.payload);
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
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unbekannter Fehler';
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.push(action.payload);
      })
      .addCase(deleteChatThunk.fulfilled, (state, action) => {
        state.chats = state.chats.filter((c) => c.chatId !== action.payload);
      })
      .addCase(deleteDraftThunk.fulfilled, (state, action) => {
        state.chats = state.chats.filter((c) => c.chatId !== action.payload);
      })
      .addCase(deleteChatThunk.rejected, (state, action) => {
        state.error = action.payload || 'Fehler beim Löschen des Chats';
      })
      .addCase(patchChat.fulfilled, (state, action) => {
        const idx = state.chats.findIndex(
          (c) => c.chatId === action.payload.chatId
        );
        if (idx !== -1) {
          state.chats[idx] = { ...state.chats[idx], ...action.payload };
        }
      })
      .addCase(saveSingleChat.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        const idx = state.chats.findIndex(
          (c) => c.chatId === updatedChat.chatId
        );
        if (idx !== -1) {
          state.chats[idx] = { ...state.chats[idx], ...updatedChat };
        }
      })
      .addCase(saveAllChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      });
  },
});

export const { setSelectedChat, setChats, addChat, updateChat, removeChat } =
  chatsSlice.actions;
export default chatsSlice.reducer;
