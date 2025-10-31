import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Comment } from '../types/Comment';
import { RootState } from './store';

type CommentsState = {
  byChatId: Record<number, Comment[]>;
  loadingByChatId: Record<number, boolean>;
  errorByChatId: Record<number, string | null>;
};

const initialState: CommentsState = {
  byChatId: {},
  loadingByChatId: {},
  errorByChatId: {},
};

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ??
  process.env.API_BASE_URL ??
  'http://localhost:8080';

// --- Thunks ---

// alle Kommentare laden (falls du eine Übersicht brauchst)
export const fetchAllComments = createAsyncThunk<
  Comment[],
  void,
  { rejectValue: string }
>('comments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return (await res.json()) as Comment[];
  } catch (e) {
    return rejectWithValue('Error loading comments');
  }
});

// Kommentare eines Chats laden
export const fetchCommentsByChat = createAsyncThunk<
  { chatId: number; comments: Comment[] },
  number,
  { rejectValue: string }
>('comments/fetchByChat', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments/by-chat/${chatId}`);
    // Falls du keinen speziellen Endpoint hast, nutze /api/comments und filtere clientseitig.
    // In deinem CommentController-Beispiel hatten wir /by-chat/{chatId} ergänzt.
    if (!res.ok) throw new Error('Failed to fetch by chat');
    const comments = (await res.json()) as Comment[];
    return { chatId, comments };
  } catch (e) {
    return rejectWithValue('Error loading comments for chat');
  }
});

// Kommentar erstellen
export const createComment = createAsyncThunk<
  { chatId: number; comment: Comment },
  Omit<Comment, 'commentId'>,
  { rejectValue: string }
>('comments/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create comment');
    const created = (await res.json()) as Comment;
    return { chatId: created.chatId, comment: created };
  } catch (e) {
    return rejectWithValue('Error creating comment');
  }
});

// Kommentar patchen (nur erlaubte Keys senden)
export const patchComment = createAsyncThunk<
  { chatId: number; comment: Comment },
  { commentId: number; updates: Partial<Comment> },
  { rejectValue: string }
>('comments/patch', async ({ commentId, updates }, { rejectWithValue }) => {
  try {
    const { sender, commentText, chatId } = updates;
    const body: Partial<Comment> = {
      ...(sender !== undefined ? { sender } : {}),
      ...(commentText !== undefined ? { commentText } : {}),
      ...(chatId !== undefined ? { chatId } : {}),
    };

    const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to patch comment');
    const updated = (await res.json()) as Comment;
    return { chatId: updated.chatId, comment: updated };
  } catch (e) {
    return rejectWithValue('Error patching comment');
  }
});

// Kommentar löschen
export const deleteCommentThunk = createAsyncThunk<
  { chatId: number; commentId: number },
  { chatId: number; commentId: number },
  { rejectValue: string }
>('comments/delete', async ({ chatId, commentId }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204)
      throw new Error('Failed to delete comment');
    return { chatId, commentId };
  } catch (e) {
    return rejectWithValue('Error deleting comment');
  }
});

// --- Slice ---

export const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setCommentsForChat(
      state,
      action: PayloadAction<{ chatId: number; comments: Comment[] }>
    ) {
      state.byChatId[action.payload.chatId] = action.payload.comments;
    },
    clearCommentsForChat(state, action: PayloadAction<number>) {
      delete state.byChatId[action.payload];
      delete state.loadingByChatId[action.payload];
      delete state.errorByChatId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllComments.fulfilled, (state, action) => {
        // optional: hier könntest du nach chatId gruppieren
        for (const c of action.payload) {
          state.byChatId[c.chatId] = (state.byChatId[c.chatId] ?? []).concat([
            c,
          ]);
        }
      })
      .addCase(fetchCommentsByChat.pending, (state, action) => {
        state.loadingByChatId[action.meta.arg] = true;
        state.errorByChatId[action.meta.arg] = null;
      })
      .addCase(fetchCommentsByChat.fulfilled, (state, action) => {
        state.loadingByChatId[action.payload.chatId] = false;
        state.byChatId[action.payload.chatId] = action.payload.comments;
      })
      .addCase(fetchCommentsByChat.rejected, (state, action) => {
        const chatId = action.meta.arg;
        state.loadingByChatId[chatId] = false;
        state.errorByChatId[chatId] = action.payload ?? 'Error';
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { chatId, comment } = action.payload;
        state.byChatId[chatId] = [...(state.byChatId[chatId] ?? []), comment];
      })
      .addCase(patchComment.fulfilled, (state, action) => {
        const { chatId, comment } = action.payload;
        const arr = state.byChatId[chatId] ?? [];
        const idx = arr.findIndex((c) => c.commentId === comment.commentId);
        if (idx !== -1) arr[idx] = { ...arr[idx], ...comment };
        state.byChatId[chatId] = arr;
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const { chatId, commentId } = action.payload;
        state.byChatId[chatId] = (state.byChatId[chatId] ?? []).filter(
          (c) => c.commentId !== commentId
        );
      });
  },
});

export const { setCommentsForChat, clearCommentsForChat } =
  commentsSlice.actions;

export const selectCommentsByChat = (state: RootState, chatId: number) =>
  state.comments.byChatId[chatId] ?? [];

export const selectCommentsLoadingByChat = (state: RootState, chatId: number) =>
  state.comments.loadingByChatId[chatId] ?? false;

export default commentsSlice.reducer;
