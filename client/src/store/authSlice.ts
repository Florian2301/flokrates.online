import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from './store';

type User = {
  authorId: number;
  email: string;
  roles: string[]; // z.B. ["ROLE_USER","ROLE_ADMIN"]
  authorName?: string | null;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: localStorage.getItem('authUser')
    ? JSON.parse(localStorage.getItem('authUser')!)
    : null,
  loading: false,
  error: null,
};

// Hilfsfunktion: JWT payload dekodieren (ohne libs)
function decodeJwt<T = any>(token: string): T | null {
  try {
    const base = token.split('.')[1];
    const base64 = base.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );
    const binary = atob(padded);
    // UTF-8 sicher dekodieren
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// === Thunks ===
// Erwartete Backend-Antwort bei Login: { accessToken: string, user?: {...} }
// Refresh via Cookie (httpOnly) empfohlen -> fetch mit credentials: 'include'
export const login = createAsyncThunk<
  { accessToken: string; refreshToken: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (body, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // wichtig, falls Refresh per Cookie
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('LOGIN FAILED', res.status, txt);
      throw new Error(txt || 'Login failed');
    }
    const json = await res.json();
    let user: User | undefined = json.user;

    if (!user && json.accessToken) {
      const payload = decodeJwt(json.accessToken);
      // -> passe Claims an deine Backend-Payload an (sub, roles, authorId, name…)
      user = {
        authorId: payload?.authorId ?? 0,
        email: payload?.sub ?? '',
        roles: payload?.roles ?? [],
        authorName: payload?.name ?? null,
      };
    }

    if (!json.accessToken || !user) throw new Error('Malformed login response');

    return {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      user,
    };
  } catch (e: any) {
    return rejectWithValue(e.message || 'Login failed');
  }
});

export const refresh = createAsyncThunk<
  { accessToken: string; refreshToken: string }, // Rotation möglich
  void,
  { state: RootState; rejectValue: string }
>('auth/refresh', async (_, { getState, rejectWithValue }) => {
  try {
    const rt =
      getState().auth.refreshToken || localStorage.getItem('refreshToken');
    if (!rt) throw new Error('No refresh token');

    const res = await fetch(`/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt, device: 'web' }),
    });
    if (!res.ok) throw new Error('Refresh failed');

    const json = await res.json();
    if (!json.accessToken || !json.refreshToken)
      throw new Error('Malformed refresh response');

    return { accessToken: json.accessToken, refreshToken: json.refreshToken };
  } catch (e: any) {
    return rejectWithValue(e.message || 'Refresh failed');
  }
});

export const logout = createAsyncThunk<void, void, { state: RootState }>(
  'auth/logout',
  async (_, { getState }) => {
    const rt =
      getState().auth.refreshToken || localStorage.getItem('refreshToken');
    try {
      await fetch(`/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rt
          ? JSON.stringify({ refreshToken: rt, device: 'web' })
          : undefined,
      });
    } catch {
      // Ignorieren – wir räumen lokal sowieso auf
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      action.payload
        ? localStorage.setItem('accessToken', action.payload)
        : localStorage.removeItem('accessToken');
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      action.payload
        ? localStorage.setItem('authUser', JSON.stringify(action.payload))
        : localStorage.removeItem('authUser');
    },
    setRefreshToken(state, action: PayloadAction<string | null>) {
      state.refreshToken = action.payload;
      action.payload
        ? localStorage.setItem('refreshToken', action.payload)
        : localStorage.removeItem('refreshToken');
    },
    rehydrateFromToken(state) {
      if (state.accessToken && !state.user) {
        const p = decodeJwt(state.accessToken);
        if (p) {
          state.user = {
            authorId: p?.authorId ?? 0,
            email: p?.sub ?? '',
            roles: p?.roles ?? [],
            authorName: p?.name ?? null,
          };
          localStorage.setItem('authUser', JSON.stringify(state.user));
        }
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => {
      s.loading = false;
      s.accessToken = a.payload.accessToken;
      s.refreshToken = a.payload.refreshToken;
      s.user = a.payload.user;
      localStorage.setItem('accessToken', s.accessToken!);
      localStorage.setItem('refreshToken', s.refreshToken!);
      localStorage.setItem('authUser', JSON.stringify(s.user));
    });
    b.addCase(login.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || 'Login failed';
    });

    b.addCase(refresh.fulfilled, (s, a) => {
      s.accessToken = a.payload.accessToken;
      s.refreshToken = a.payload.refreshToken;
      localStorage.setItem('accessToken', s.accessToken!);
    });
    b.addCase(refresh.rejected, (s) => {
      // Refresh kaputt -> ausloggen
      s.accessToken = null;
      s.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
    });

    b.addCase(logout.fulfilled, (s) => {
      s.accessToken = null;
      s.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
    });
  },
});

export const { setAccessToken, setUser, setRefreshToken, rehydrateFromToken } =
  authSlice.actions;

export const selectAccessToken = (s: RootState) => s.auth.accessToken;
export const selectAuthUser = (s: RootState) => s.auth.user;
export const selectIsAuthenticated = (s: RootState) => !!s.auth.accessToken;
export const selectHasRole = (role: string) => (s: RootState) =>
  (s.auth.user?.roles ?? []).includes(role);

export default authSlice.reducer;
