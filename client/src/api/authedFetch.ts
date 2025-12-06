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
  const state = getState();
  const token = selectAccessToken(state);

  const headers = new Headers(init.headers || {});
  const body = init.body;
  const isFormData = body instanceof FormData;

  // Auth
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Content-Type **nur**, wenn es KEIN FormData ist
  if (!isFormData && body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(apiUrl(input), {
    credentials: 'include',
    ...init,
    headers,
  });

  if (res.status !== 401 || !retry) return res;

  // === Retry mit frischem Token ===
  const r = await dispatch(refresh());
  if (refresh.fulfilled.match(r)) {
    const newToken = selectAccessToken(getState());
    const retryHeaders = new Headers(init.headers || {});
    const retryBody = init.body;
    const retryIsFormData = retryBody instanceof FormData;

    if (newToken) {
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
    }

    if (!retryIsFormData && retryBody && !retryHeaders.has('Content-Type')) {
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
