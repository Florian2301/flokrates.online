export function resizeTextareaPreserveCaret(ta: HTMLTextAreaElement) {
  const start = ta.selectionStart ?? 0;
  const end = ta.selectionEnd ?? 0;
  const prevScrollTop = ta.scrollTop;

  ta.style.height = 'auto';
  ta.style.height = `${ta.scrollHeight}px`;

  requestAnimationFrame(() => {
    try {
      ta.setSelectionRange(start, end);
    } catch {}
    ta.scrollTop = prevScrollTop;
  });
}
