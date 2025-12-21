import { AppDispatch, RootState } from './store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { About } from '../types/About';
import { apiUrl } from '../config';
import { authedFetch } from '../api/authedFetch';

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

// Load all
export const fetchAbouts = createAsyncThunk<
  About[],
  void,
  { rejectValue: string }
>('abouts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl(`/abouts`));
    if (!res.ok) throw new Error('Failed to fetch abouts');
    return (await res.json()) as About[];
  } catch {
    return rejectWithValue('Error loading about entries');
  }
});

// Create new
export const createAbout = createAsyncThunk<
  About,
  Omit<About, 'id'>,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('abouts/create', async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const res = await authedFetch(dispatch, getState, `/abouts`, {
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

// Edit Abouts
export const patchAbout = createAsyncThunk<
  About,
  { id: number; updates: Partial<About> },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'abouts/patch',
  async ({ id, updates }, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(dispatch, getState, `/abouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to patch about');
      return (await res.json()) as About;
    } catch {
      return rejectWithValue('Error updating about entry');
    }
  }
);

// Delete About
export const deleteAbout = createAsyncThunk<
  number,
  number,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('abouts/delete', async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const res = await authedFetch(dispatch, getState, `/abouts/${id}`, {
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
      .addCase(createAbout.rejected, (state, action) => {
        state.error =
          (action.payload as string) ?? 'Error creating about entry';
      });
  },
});

export const { clearAbouts } = aboutSlice.actions;

export const selectAllAbouts = (state: RootState) => state.about.items;
export const selectAboutById = (state: RootState, id: number) =>
  state.about.items.find((a) => a.id === id);

export default aboutSlice.reducer;
