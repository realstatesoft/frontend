/**
 * Convierte HTML (p. ej. de plantillas TipTap/Quill) a texto plano legible.
 * Útil al volcar plantillas en el campo de términos del contrato (texto plano).
 */
export function htmlToPlainText(html) {
  if (html == null) return '';
  const s = String(html).trim();
  if (!s) return '';
  if (!/<[a-z][\s\S]*>/i.test(s)) return s;
  try {
    const doc = new DOMParser().parseFromString(s, 'text/html');
    const text = doc.body?.innerText ?? '';
    return text.replace(/\n{3,}/g, '\n\n').trim();
  } catch {
    return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/** True si el HTML tiene texto visible (no solo <p></p> o espacios). */
export function hasMeaningfulHtmlContent(html) {
  return htmlToPlainText(html).length > 0;
}

/**
 * Convierte texto plano multilínea a HTML mínimo para TipTap.
 * Si ya parece HTML, se devuelve tal cual.
 */
export function plainTextToTipTapHtml(text) {
  if (text == null) return '';
  const s = String(text);
  const trimmed = s.trim();
  if (!trimmed) return '';
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return s;
  const esc = (t) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return trimmed
    .split(/\n\n+/)
    .map((block) => `<p>${esc(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
