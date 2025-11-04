import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { About } from '../types/About';
import { RootState } from './store';

type AboutsState = {
  items: About[];
  loading: boolean;
  error: string | null;
};

const initialState: AboutsState = {
  items: [],
  loading: false,
  error: null,
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

// --- Thunks ---

// Alle Abouts laden
export const fetchAbouts = createAsyncThunk<
  About[],
  void,
  { rejectValue: string }
>('abouts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abouts`);
    if (!res.ok) throw new Error('Failed to fetch abouts');
    return (await res.json()) as About[];
  } catch {
    return rejectWithValue('Error loading about entries');
  }
});

// Einzelnes About laden
export const fetchAboutById = createAsyncThunk<
  About,
  number,
  { rejectValue: string }
>('abouts/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abouts/${id}`);
    if (!res.ok) throw new Error('Not found');
    return (await res.json()) as About;
  } catch {
    return rejectWithValue('Error loading about entry');
  }
});

// Neues About erstellen
export const createAbout = createAsyncThunk<
  About,
  Omit<About, 'id'>,
  { rejectValue: string }
>('abouts/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create about');
    return (await res.json()) as About;
  } catch {
    return rejectWithValue('Error creating about entry');
  }
});

// About bearbeiten (PATCH)
export const patchAbout = createAsyncThunk<
  About,
  { id: number; updates: Partial<About> },
  { rejectValue: string }
>('abouts/patch', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abouts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to patch about');
    return (await res.json()) as About;
  } catch {
    return rejectWithValue('Error updating about entry');
  }
});

// About löschen
export const deleteAbout = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('abouts/delete', async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/abouts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204)
      throw new Error('Failed to delete about');
    return id;
  } catch {
    return rejectWithValue('Error deleting about entry');
  }
});

// --- Slice ---

export const aboutSlice = createSlice({
  name: 'about',
  initialState,
  reducers: {
    clearAbouts(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAbouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAbouts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAbouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error loading abouts';
      })
      .addCase(createAbout.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(patchAbout.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAbout.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      })
      .addCase(fetchAboutById.fulfilled, (state, action) => {
        const existingIdx = state.items.findIndex(
          (a) => a.id === action.payload.id
        );
        if (existingIdx === -1) {
          state.items.push(action.payload);
        } else {
          state.items[existingIdx] = action.payload;
        }
      });
  },
});

export const { clearAbouts } = aboutSlice.actions;

// --- Selectors ---
export const selectAllAbouts = (state: RootState) => state.about.items;
export const selectAboutById = (state: RootState, id: number) =>
  state.about.items.find((a) => a.id === id);
export default aboutSlice.reducer;
