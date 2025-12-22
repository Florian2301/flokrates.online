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
