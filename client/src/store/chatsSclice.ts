import { AppDispatch, RootState } from './store';
import { Chat, Status } from '../types/Chats';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { LanguageCode } from '../constants/language';
import { authedFetch } from '../api/authedFetch';
import { clearMessagesForChat } from './messagesSlice';

type ChatsState = {
  chats: Chat[];
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;
  referencesByChatId: Record<number, Chat[]>;
  referencesLoadingByChatId: Record<number, boolean>;
  messageCountsByChatId: Record<number, number>;
  messageCountsLoading: boolean;
  messageCountsError: string | null;
  loaded: boolean;
};

const initialState: ChatsState = {
  chats: [],
  selectedChat: localStorage.getItem('selectedChat')
    ? JSON.parse(localStorage.getItem('selectedChat')!)
    : null,
  loading: false,
  error: null,
  referencesByChatId: {},
  referencesLoadingByChatId: {},
  messageCountsByChatId: {},
  messageCountsLoading: false,
  messageCountsError: null,
  loaded: false,
};

// get all chats
export const fetchChats = createAsyncThunk<
  Chat[],
  void,
  { rejectValue: string }
>('chats/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/chats`);
    if (!res.ok) throw new Error('Error loading chats');
    const data: Chat[] = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Error loading chats');
  }
});

// create chat
export const createChat = createAsyncThunk<
  Chat,
  Omit<Chat, 'chatId'>,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'chats/createChat',
  async (newChat, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(dispatch, getState, `/api/chats`, {
        method: 'POST',
        body: JSON.stringify(newChat),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error creating chat:', res.status, errorText);
        throw new Error('Error creating chat');
      }

      const data: Chat =
        res.status !== 204
          ? await res.json()
          : { ...newChat, chatId: Date.now() };
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Error creating chat');
    }
  }
);

// save single chat
export const saveSingleChat = createAsyncThunk<
  Chat,
  { chatId: number; updates: Partial<Chat> },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'chats/saveSingle',
  async ({ chatId, updates }, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(
        dispatch,
        getState,
        `/api/chats/${chatId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );

      if (!res.ok) throw new Error('Error saving chat');
      const updated = await res.json();
      return updated as Chat;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Error saving chat');
    }
  }
);

// save all chats
export const saveAllChats = createAsyncThunk<
  Chat[],
  Chat[],
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('chats/saveAll', async (chats, { dispatch, getState, rejectWithValue }) => {
  try {
    await Promise.all(
      chats.map(async (chat) => {
        const res = await authedFetch(
          dispatch,
          getState,
          `/api/chats/${chat.chatId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(chat),
          }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Error saving chat ${chat.chatId}: ${res.status} ${text}`
          );
        }
      })
    );
    return chats;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Error saving chats');
  }
});

// delete chat (+ messages & network via backend)
export const deleteChatThunk = createAsyncThunk<
  number, // Feedback from Server (could also be boolean)
  number, // chatId as parameter (dispatch(deleteChatThink(3)))
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'chats/deleteChat',
  async (chatId, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const chats = state.chats.chats;
      const chatToDelete = chats.find((c) => c.chatId === chatId);
      if (!chatToDelete) return chatId;

      const res = await authedFetch(
        dispatch,
        getState,
        `/api/chats/${chatId}`,
        {
          method: 'DELETE',
        }
      );
      if (!res.ok) throw new Error('Error deleting chat');

      // delete messages for chat in state
      dispatch(clearMessagesForChat(chatId));

      // delete referenced chats
      delete state.chats.referencesByChatId[chatId];
      delete state.chats.referencesLoadingByChatId[chatId];
      Object.keys(state.chats.referencesByChatId).forEach((k) => {
        const key = Number(k);
        state.chats.referencesByChatId[key] =
          state.chats.referencesByChatId[key]?.filter(
            (ref) => ref.chatId !== chatId
          ) ?? [];
      });

      // set new chatnumbers for chats
      let updatedChats = chats.filter((c) => c.chatId !== chatId);
      if (chatToDelete.chatNumber !== null) {
        updatedChats = updatedChats
          .map((c) =>
            c.chatNumber !== null &&
            c.chatNumber > chatToDelete.chatNumber! &&
            c.status === ('PUB' as Status)
              ? { ...c, chatNumber: c.chatNumber - 1 }
              : c
          )
          .sort((a, b) => {
            if (a.chatNumber === null) return 1;
            if (b.chatNumber === null) return -1;
            return a.chatNumber - b.chatNumber;
          });
      }
      dispatch(setChats(updatedChats));

      await dispatch(saveAllChats(updatedChats));

      const wasSelected = state.chats.selectedChat?.chatId === chatId;
      if (wasSelected) {
        dispatch(setSelectedChat(null));
      }

      return chatId;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Error deleting chat');
    }
  }
);

// patch chat
export const patchChat = createAsyncThunk<
  Chat,
  { chatId: number; updates: Partial<Chat> },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'chats/patchChat',
  async ({ chatId, updates }, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(
        dispatch,
        getState,
        `/api/chats/${chatId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      if (!res.ok) throw new Error('Error patching chat');
      const updatedChat: Chat = await res.json();
      return updatedChat;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Error patching chat');
    }
  }
);

// get referenced chats for selectedchat
export const fetchChatReferences = createAsyncThunk<
  Chat[], // return list of referenced chats
  number, // Arg: chatId
  { rejectValue: string }
>('chats/fetchChatReferences', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/chats/${chatId}/references`);
    if (!res.ok) throw new Error('Error loading references');
    const data: Chat[] = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Error loading references');
  }
});

//MessageCount
export const fetchMessageCounts = createAsyncThunk<
  Record<number, number>, // Return: Map chatId -> count
  number[] | undefined, // Arg: Liste von IDs oder undefined
  { rejectValue: string }
>('chats/fetchMessageCounts', async (ids, { rejectWithValue }) => {
  try {
    const url =
      ids && ids.length
        ? `/api/chats/counts?ids=${encodeURIComponent(ids.join(','))}`
        : `/api/chats/counts`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Error loading message counts');

    // Server liefert Keys als Strings -> in Numbers mappen
    const raw: Record<string, number> = await res.json();
    const normalized: Record<number, number> = {};
    Object.entries(raw).forEach(([k, v]) => {
      normalized[Number(k)] = v ?? 0;
    });

    // Falls ids mitgegeben wurden: fehlende IDs auf 0 setzen (Safety)
    if (ids && ids.length)
      ids.forEach((id) => {
        if (normalized[id] == null) normalized[id] = 0;
      });

    return normalized;
  } catch (err) {
    console.error(err);
    return rejectWithValue('Error loading message counts');
  }
});

export const fetchChatsWithCounts = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>('chats/fetchChatsWithCounts', async (_, { dispatch, getState }) => {
  const { loaded, chats } = getState().chats;

  if (!loaded || chats.length === 0) {
    await dispatch(fetchChats());
  }

  const ids = getState()
    .chats.chats.map((c) => c.chatId)
    .filter((x): x is number => x != null);

  if (ids.length) {
    await dispatch(fetchMessageCounts(ids));
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
        state.loaded = true;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
        state.loaded = false;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.push(action.payload);
        state.loaded = true;
      })
      .addCase(deleteChatThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.chats = state.chats.filter((c) => c.chatId !== deletedId);
        delete state.messageCountsByChatId[deletedId];
      })
      .addCase(deleteChatThunk.rejected, (state, action) => {
        state.error = action.payload || 'Error deleting chat';
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
        state.loaded = true;
      })
      .addCase(fetchChatReferences.pending, (state, action) => {
        const chatId = action.meta.arg;
        state.referencesLoadingByChatId[chatId] = true;
      })
      .addCase(fetchChatReferences.fulfilled, (state, action) => {
        const chatId = action.meta.arg;
        state.referencesByChatId[chatId] = action.payload;
        state.referencesLoadingByChatId[chatId] = false;
      })
      .addCase(fetchChatReferences.rejected, (state, action) => {
        const chatId = action.meta.arg;
        state.referencesLoadingByChatId[chatId] = false;
        state.error = action.payload || 'Error loading references';
      })
      .addCase(fetchMessageCounts.pending, (state) => {
        state.messageCountsLoading = true;
        state.messageCountsError = null;
      })
      .addCase(fetchMessageCounts.fulfilled, (state, action) => {
        state.messageCountsLoading = false;
        // flach mergen: neue Counts überschreiben vorhandene
        state.messageCountsByChatId = {
          ...state.messageCountsByChatId,
          ...action.payload,
        };
      })
      .addCase(fetchMessageCounts.rejected, (state, action) => {
        state.messageCountsLoading = false;
        state.messageCountsError =
          action.payload || 'Error loading message counts';
      });
  },
});

export const { setSelectedChat, setChats, addChat, updateChat, removeChat } =
  chatsSlice.actions;

export const selectReferencesForSelectedChat = (state: RootState) => {
  const sc = state.chats.selectedChat;
  if (!sc) return [];
  return state.chats.referencesByChatId[sc.chatId] ?? [];
};

export const selectReferencesLoadingForSelectedChat = (state: RootState) => {
  const sc = state.chats.selectedChat;
  if (!sc) return false;
  return state.chats.referencesLoadingByChatId[sc.chatId] ?? false;
};

export const selectMessageCountMap = (state: RootState) =>
  state.chats.messageCountsByChatId;

export const selectMessageCountLoading = (state: RootState) =>
  state.chats.messageCountsLoading;

export const selectMessageCountFor = (chatId: number) => (state: RootState) =>
  state.chats.messageCountsByChatId[chatId] ?? 0;

export const selectChatsLoaded = (state: RootState) => state.chats.loaded;
export const selectPublishedChatsByLanguage = (
  state: RootState,
  lang: LanguageCode
) => state.chats.chats.filter((c) => c.status === 'PUB' && c.language === lang);

export const selectDraftsByLanguage = (state: RootState, lang: LanguageCode) =>
  state.chats.chats.filter((c) => c.status !== 'PUB' && c.language === lang);

export default chatsSlice.reducer;
