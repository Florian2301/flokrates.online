import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Network } from '../types/Network';
import { RootState } from './store';

type NetworksState = {
  refsByChatId: Record<number, Network[]>; // outgoing references (chatId -> list of refs)
  backRefsByChatId: Record<number, Network[]>; // incoming references (refId -> list of chats that refer)
  loadingByChatId: Record<number, boolean>;
  backLoadingByChatId: Record<number, boolean>;
  error?: string | null;
};

const initialState: NetworksState = {
  refsByChatId: {},
  backRefsByChatId: {},
  loadingByChatId: {},
  backLoadingByChatId: {},
  error: null,
};

// --- Thunks ---

export const fetchRefsByChat = createAsyncThunk<
  { chatId: number; refs: Network[] },
  number,
  { rejectValue: string }
>('networks/fetchRefsByChat', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/networks/by-chat/${chatId}`);
    if (!res.ok) throw new Error('Failed to load refs');
    const refs = (await res.json()) as Network[];
    return { chatId, refs };
  } catch {
    return rejectWithValue('Error loading references');
  }
});

export const fetchBackRefsForChat = createAsyncThunk<
  { chatId: number; refs: Network[] },
  number,
  { rejectValue: string }
>('networks/fetchBackRefsForChat', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/networks/by-ref/${chatId}`);
    if (!res.ok) throw new Error('Failed to load back-refs');
    const refs = (await res.json()) as Network[];
    return { chatId, refs };
  } catch {
    return rejectWithValue('Error loading back-references');
  }
});

// upsert reference (chatId -> refId)
export const upsertReference = createAsyncThunk<
  { chatId: number; network: Network },
  { chatId: number; refId: number },
  { rejectValue: string }
>(
  'networks/upsertReference',
  async ({ chatId, refId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/networks/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, refId }),
      });
      if (!res.ok) throw new Error('Failed to upsert reference');
      const saved = (await res.json()) as Network;
      return { chatId: saved.chatId, network: saved };
    } catch {
      return rejectWithValue('Error creating reference');
    }
  }
);

// delete reference
export const deleteReference = createAsyncThunk<
  { chatId: number; refId: number },
  { chatId: number; refId: number },
  { rejectValue: string }
>(
  'networks/deleteReference',
  async ({ chatId, refId }, { rejectWithValue }) => {
    try {
      const url = new URL(`/api/networks/references`);
      url.searchParams.set('chatId', String(chatId));
      url.searchParams.set('refId', String(refId));
      const res = await fetch(url.toString(), { method: 'DELETE' });
      if (!res.ok && res.status !== 204)
        throw new Error('Failed to delete reference');
      return { chatId, refId };
    } catch {
      return rejectWithValue('Error deleting reference');
    }
  }
);

// --- Slice ---

export const networksSlice = createSlice({
  name: 'networks',
  initialState,
  reducers: {
    clearRefs(state, action: PayloadAction<number>) {
      const chatId = action.payload;
      delete state.refsByChatId[chatId];
      delete state.loadingByChatId[chatId];
    },
    clearBackRefs(state, action: PayloadAction<number>) {
      const chatId = action.payload;
      delete state.backRefsByChatId[chatId];
      delete state.backLoadingByChatId[chatId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRefsByChat.pending, (state, action) => {
        state.loadingByChatId[action.meta.arg] = true;
      })
      .addCase(fetchRefsByChat.fulfilled, (state, action) => {
        state.loadingByChatId[action.payload.chatId] = false;
        state.refsByChatId[action.payload.chatId] = action.payload.refs;
      })
      .addCase(fetchRefsByChat.rejected, (state, action) => {
        const chatId = action.meta.arg;
        state.loadingByChatId[chatId] = false;
        state.error = action.payload ?? 'Error loading references';
      })
      .addCase(fetchBackRefsForChat.pending, (state, action) => {
        state.backLoadingByChatId[action.meta.arg] = true;
      })
      .addCase(fetchBackRefsForChat.fulfilled, (state, action) => {
        state.backLoadingByChatId[action.payload.chatId] = false;
        state.backRefsByChatId[action.payload.chatId] = action.payload.refs;
      })
      .addCase(fetchBackRefsForChat.rejected, (state, action) => {
        const chatId = action.meta.arg;
        state.backLoadingByChatId[chatId] = false;
        state.error = action.payload ?? 'Error loading back-refs';
      })
      .addCase(upsertReference.fulfilled, (state, action) => {
        const { chatId, network } = action.payload;
        const arr = state.refsByChatId[chatId] ?? [];
        const exists = arr.find((n) => n.refId === network.refId);
        state.refsByChatId[chatId] = exists
          ? arr.map((n) => (n.refId === network.refId ? network : n))
          : [...arr, network];
      })
      .addCase(deleteReference.fulfilled, (state, action) => {
        const { chatId, refId } = action.payload;
        state.refsByChatId[chatId] = (state.refsByChatId[chatId] ?? []).filter(
          (n) => n.refId !== refId
        );
      });
  },
});

export const { clearRefs, clearBackRefs } = networksSlice.actions;

export const selectRefsByChat = (state: RootState, chatId: number) =>
  state.networks.refsByChatId[chatId] ?? [];

export const selectBackRefsByChat = (state: RootState, chatId: number) =>
  state.networks.backRefsByChatId[chatId] ?? [];

export const selectRefsLoading = (state: RootState, chatId: number) =>
  state.networks.loadingByChatId[chatId] ?? false;

export const selectBackRefsLoading = (state: RootState, chatId: number) =>
  state.networks.backLoadingByChatId[chatId] ?? false;

export default networksSlice.reducer;
