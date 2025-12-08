export const isImageContentType = (ct?: string | null) =>
  !!ct && ct.startsWith('image/');

export const isPdfContentType = (ct?: string | null) =>
  !!ct && ct.toLowerCase().startsWith('application/pdf');

export const toAbsoluteUrl = (u?: string | null) => {
  if (!u) return null;
  if (u.startsWith('/')) return u; // interne Routen
  if (/^https?:\/\//i.test(u)) return u; // absolute URL
  return `https://${u}`; // pure Domains -> https
};
