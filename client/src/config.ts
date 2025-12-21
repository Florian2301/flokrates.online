/*const raw = (process.env.API_BASE_URL || '').trim();

// Normalisiere Basis-URL (ohne trailing Slash). Leerer String => relative Pfade (gut für Proxy)
export const API_BASE = raw && raw !== '/' ? raw.replace(/\/+$/, '') : '';

// Baut aus Pfaden eine absolute oder relative URL
export const apiUrl = (path: string) =>
  path.startsWith('http') ? path : `${API_BASE}${path}`;
*/
// src/config.ts

// Immer über das gleiche Gateway: /api
export const API_BASE = '/api';

// Baut aus Pfaden eine API-URL
export const apiUrl = (path: string) => {
  // komplette URLs (http...) einfach durchreichen
  if (path.startsWith('http')) return path;

  // sicherstellen, dass path mit "/" beginnt
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};
