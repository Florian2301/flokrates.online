import type { AppDispatch, RootState } from '../store/store';
import { refresh, selectAccessToken } from '../store/authSlice';

import { apiUrl } from '../config';

export async function authedFetch(
  dispatch: AppDispatch,
  getState: () => RootState,
  input: string,
  init: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = selectAccessToken(getState());
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Falls du Refresh über HttpOnly-Cookie machst, lass credentials generell an:
  const res = await fetch(apiUrl(input), {
    credentials: 'include',
    ...init,
    headers,
  });

  if (res.status !== 401 || !retry) return res;

  // 401 -> Refresh versuchen
  const r = await dispatch(refresh());
  if (refresh.fulfilled.match(r)) {
    const newToken = selectAccessToken(getState());
    const retryHeaders = new Headers(init.headers || {});
    if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`);
    if (!retryHeaders.has('Content-Type') && init.body) {
      retryHeaders.set('Content-Type', 'application/json');
    }
    return fetch(apiUrl(input), {
      credentials: 'include',
      ...init,
      headers: retryHeaders,
    });
  }

  return res;
}
