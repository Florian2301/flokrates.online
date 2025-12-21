import type { AppDispatch, RootState } from './store';
import type { Comment, NewCommentPayload } from '../types/Comment';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { apiUrl } from '../config';
import { authedFetch } from '../api/authedFetch';

type CommentsState = {
  byChatId: Record<number, Comment[]>;
  loadingByChatId: Record<number, boolean>;
  error?: string | null;
};

const initialState: CommentsState = {
  byChatId: {},
  loadingByChatId: {},
  error: null,
};

// ---------- Helpers ----------
async function readError(res: Response) {
  const text = await res.text().catch(() => '');
  return `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`;
}

function sortByDateCreatedAsc(list: Comment[]) {
  return [...list].sort(
    (a, b) =>
      new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
  );
}

// ---------- Thunks ----------

// Alle Kommentare für einen Chat (unpaged)
export const fetchCommentsForChat = createAsyncThunk<
  { chatId: number; comments: Comment[] },
  number,
  { rejectValue: string }
>('comments/fetchForChat', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl(`/comments/by-chat/${chatId}`));
    if (!res.ok) return rejectWithValue(await readError(res));
    const data = (await res.json()) as Comment[];
    return { chatId, comments: sortByDateCreatedAsc(data) };
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error loading comments');
  }
});

// Kommentar anlegen
export const createComment = createAsyncThunk<
  Comment,
  NewCommentPayload,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'comments/create',
  async (newComment, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(dispatch, getState, `/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });
      if (!res.ok) return rejectWithValue(await readError(res));
      return (await res.json()) as Comment;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error creating comment');
    }
  }
);

// Kommentar patchen
export const patchComment = createAsyncThunk<
  Comment,
  {
    commentId: number;
    updates: Partial<Pick<Comment, 'chatId' | 'sender' | 'commentText'>>;
  },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'comments/patch',
  async ({ commentId, updates }, { dispatch, getState, rejectWithValue }) => {
    try {
      const body: Record<string, unknown> = {};
      if (updates.chatId !== undefined) body.chatId = updates.chatId;
      if (updates.sender !== undefined) body.sender = updates.sender;
      if (updates.commentText !== undefined)
        body.commentText = updates.commentText;

      const res = await authedFetch(
        dispatch,
        getState,
        `/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) return rejectWithValue(await readError(res));
      return (await res.json()) as Comment;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error patching comment');
    }
  }
);

// Kommentar löschen
export const deleteCommentThunk = createAsyncThunk<
  { commentId: number; chatId: number },
  { commentId: number; chatId: number },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'comments/delete',
  async ({ commentId, chatId }, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(
        dispatch,
        getState,
        `/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );
      if (!res.ok && res.status !== 204) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
        );
      }
      return { commentId, chatId };
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error deleting comment');
    }
  }
);

// Alle Kommentare eines Chats löschen
export const deleteCommentsByChat = createAsyncThunk<
  number,
  number,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'comments/deleteByChat',
  async (chatId, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await authedFetch(
        dispatch,
        getState,
        `/comments/by-chat/${chatId}`,
        {
          method: 'DELETE',
        }
      );
      if (!res.ok) return rejectWithValue(await readError(res));
      return chatId;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Error deleting comments by chat');
    }
  }
);

// ---------- Slice ----------
const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setCommentsForChat(
      state,
      action: PayloadAction<{ chatId: number; comments: Comment[] }>
    ) {
      state.byChatId[action.payload.chatId] = sortByDateCreatedAsc(
        action.payload.comments
      );
    },
    addComment(state, action: PayloadAction<Comment>) {
      const c = action.payload;
      const list = state.byChatId[c.chatId] ?? [];
      state.byChatId[c.chatId] = sortByDateCreatedAsc([...list, c]);
    },
    updateComment(
      state,
      action: PayloadAction<{
        commentId: number;
        chatId: number;
        changes: Partial<Comment>;
      }>
    ) {
      const { chatId, commentId, changes } = action.payload;
      const list = state.byChatId[chatId];
      if (!list) return;
      const idx = list.findIndex((x) => x.commentId === commentId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...changes };
        state.byChatId[chatId] = sortByDateCreatedAsc(list);
      }
    },
    removeComment(
      state,
      action: PayloadAction<{ commentId: number; chatId: number }>
    ) {
      const { chatId, commentId } = action.payload;
      const list = state.byChatId[chatId];
      if (!list) return;
      state.byChatId[chatId] = list.filter((c) => c.commentId !== commentId);
    },
    clearCommentsForChat(state, action: PayloadAction<number>) {
      delete state.byChatId[action.payload];
      delete state.loadingByChatId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCommentsForChat
      .addCase(fetchCommentsForChat.pending, (s, a) => {
        s.error = null;
        s.loadingByChatId[a.meta.arg] = true;
      })
      .addCase(fetchCommentsForChat.fulfilled, (s, a) => {
        const { chatId, comments } = a.payload;
        s.loadingByChatId[chatId] = false;
        s.byChatId[chatId] = comments;
      })
      .addCase(fetchCommentsForChat.rejected, (s, a) => {
        const chatId = a.meta.arg;
        if (chatId != null) {
          s.loadingByChatId[chatId] = false;
        }
        s.error =
          (a.payload as string) || a.error.message || 'Error loading comments';
      })

      // createComment
      .addCase(createComment.fulfilled, (s, a) => {
        const c = a.payload;
        const list = s.byChatId[c.chatId] ?? [];
        s.byChatId[c.chatId] = sortByDateCreatedAsc([...list, c]);
      })

      // patchComment
      .addCase(patchComment.fulfilled, (s, a) => {
        const c = a.payload;
        const list = s.byChatId[c.chatId];
        if (!list) return;
        const idx = list.findIndex((x) => x.commentId === c.commentId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...c };
          s.byChatId[c.chatId] = sortByDateCreatedAsc(list);
        } else {
          // Fallback: wenn Liste nicht geladen war, initialisiere sie
          s.byChatId[c.chatId] = [c];
        }
      })

      // deleteComment
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const { commentId, chatId } = action.payload;
        const list = state.byChatId[chatId];
        if (list)
          state.byChatId[chatId] = list.filter(
            (c) => c.commentId !== commentId
          );
      })

      // deleteCommentsByChat
      .addCase(deleteCommentsByChat.fulfilled, (s, a) => {
        const chatId = a.payload;
        delete s.byChatId[chatId];
        delete s.loadingByChatId[chatId];
      });
  },
});

export const {
  setCommentsForChat,
  addComment,
  updateComment,
  removeComment,
  clearCommentsForChat,
} = commentsSlice.actions;

export default commentsSlice.reducer;

// ---------- Selektoren ----------
export const selectCommentsForChat = (state: RootState, chatId: number) =>
  state.comments.byChatId[chatId] ?? [];

export const selectCommentsLoadingForChat = (
  state: RootState,
  chatId: number
) => !!state.comments.loadingByChatId[chatId];

export const selectCommentsError = (state: RootState) => state.comments.error;
