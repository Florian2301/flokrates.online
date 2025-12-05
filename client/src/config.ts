// CRA-Style: REACT_APP_*
const raw = (process.env.REACT_APP_API_BASE_URL || '').trim();

// Normalisiere Basis-URL (ohne trailing Slash). Leerer String => relative Pfade (gut für Proxy)
export const API_BASE = raw && raw !== '/' ? raw.replace(/\/+$/, '') : '';

// Baut aus Pfaden eine absolute oder relative URL
export const apiUrl = (path: string) =>
  path.startsWith('http') ? path : `${API_BASE}${path}`;
