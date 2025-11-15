// src/store/commentsSlice.ts

import type { Comment, NewCommentPayload } from '../types/Comment';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from './store';

type CommentsState = {
  byChatId: Record<number, Comment[]>;
  loadingByChatId: Record<number, boolean>;
  error?: string | null;
  // optional: paging-Metadaten, falls du das paged-Endpoint nutzt
  pageInfoByChatId: Record<
    number,
    | { page: number; size: number; totalPages: number; totalElements: number }
    | undefined
  >;
};

const initialState: CommentsState = {
  byChatId: {},
  loadingByChatId: {},
  error: null,
  pageInfoByChatId: {},
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

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
    const res = await fetch(`${API_BASE_URL}/api/comments/by-chat/${chatId}`);
    if (!res.ok) return rejectWithValue(await readError(res));
    const data = (await res.json()) as Comment[];
    return { chatId, comments: sortByDateCreatedAsc(data) };
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error loading comments');
  }
});

// Optional: paged Load
export const fetchCommentsForChatPaged = createAsyncThunk<
  {
    chatId: number;
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    comments: Comment[];
    mode: 'replace' | 'append';
  },
  {
    chatId: number;
    page?: number;
    size?: number;
    sort?: string;
    mode?: 'replace' | 'append';
  },
  { rejectValue: string }
>('comments/fetchForChatPaged', async (args, { rejectWithValue }) => {
  const {
    chatId,
    page = 0,
    size = 20,
    sort = 'dateCreated,asc',
    mode = 'replace',
  } = args;
  try {
    const url = `${API_BASE_URL}/api/comments/by-chat/${chatId}/paged?page=${page}&size=${size}&sort=${encodeURIComponent(
      sort
    )}`;
    const res = await fetch(url);
    if (!res.ok) return rejectWithValue(await readError(res));

    // Spring Page<T>
    const pg = await res.json();
    const comments = sort.includes('desc')
      ? (pg.content as Comment[])
      : sortByDateCreatedAsc(pg.content as Comment[]);

    return {
      chatId,
      page: pg.number,
      size: pg.size,
      totalPages: pg.totalPages,
      totalElements: pg.totalElements,
      comments,
      mode,
    };
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error loading comments (paged)');
  }
});

// Alle Kommentare (systemweit) – optional, wenn du eine Admin-Ansicht hast
export const fetchAllComments = createAsyncThunk<
  Comment[],
  void,
  { rejectValue: string }
>('comments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments`);
    if (!res.ok) return rejectWithValue(await readError(res));
    return (await res.json()) as Comment[];
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error loading all comments');
  }
});

// Kommentar anlegen
export const createComment = createAsyncThunk<
  Comment,
  NewCommentPayload,
  { rejectValue: string }
>('comments/create', async (newComment, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment),
    });
    if (!res.ok) return rejectWithValue(await readError(res));
    return (await res.json()) as Comment;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error creating comment');
  }
});

// Kommentar patchen
export const patchComment = createAsyncThunk<
  Comment,
  {
    commentId: number;
    updates: Partial<Pick<Comment, 'chatId' | 'sender' | 'commentText'>>;
  },
  { rejectValue: string }
>('comments/patch', async ({ commentId, updates }, { rejectWithValue }) => {
  try {
    const body: Record<string, unknown> = {};
    if (updates.chatId !== undefined) body.chatId = updates.chatId;
    if (updates.sender !== undefined) body.sender = updates.sender;
    if (updates.commentText !== undefined)
      body.commentText = updates.commentText;

    const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return rejectWithValue(await readError(res));
    return (await res.json()) as Comment;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error patching comment');
  }
});

// Kommentar löschen
export const deleteCommentThunk = createAsyncThunk<
  { commentId: number; chatId: number },
  { commentId: number; chatId: number },
  { rejectValue: string }
>('comments/delete', async ({ commentId, chatId }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
    });
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
});

// Alle Kommentare eines Chats löschen
export const deleteCommentsByChat = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('comments/deleteByChat', async (chatId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/comments/by-chat/${chatId}`, {
      method: 'DELETE',
    });
    if (!res.ok) return rejectWithValue(await readError(res));
    return chatId;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Error deleting comments by chat');
  }
});

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
      delete state.pageInfoByChatId[action.payload];
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
        s.error = a.payload || a.error.message || 'Error loading comments';
        // kein spezifischer chatId verfügbar hier
      })

      // fetchCommentsForChatPaged
      .addCase(fetchCommentsForChatPaged.pending, (s, a) => {
        s.error = null;
        s.loadingByChatId[a.meta.arg.chatId] = true;
      })
      .addCase(fetchCommentsForChatPaged.fulfilled, (s, a) => {
        const {
          chatId,
          comments,
          mode,
          page,
          size,
          totalElements,
          totalPages,
        } = a.payload;
        s.loadingByChatId[chatId] = false;
        const current = s.byChatId[chatId] ?? [];
        s.byChatId[chatId] =
          mode === 'append'
            ? sortByDateCreatedAsc([...current, ...comments])
            : comments;
        s.pageInfoByChatId[chatId] = { page, size, totalElements, totalPages };
      })
      .addCase(fetchCommentsForChatPaged.rejected, (s, a) => {
        s.error =
          a.payload || a.error.message || 'Error loading comments (paged)';
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
        delete s.pageInfoByChatId[chatId];
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

export const selectCommentsPageInfo = (state: RootState, chatId: number) =>
  state.comments.pageInfoByChatId[chatId];
