/** Treat visually empty editor HTML as an empty string for form dirty checks. */
export function normalizeRichTextHtml(html: string | undefined): string {
  const trimmed = (html ?? '').trim()
  if (trimmed === '') return ''

  const textContent = extractRichTextContent(trimmed)

  return textContent === '' ? '' : trimmed
}

/** Plain-text content for semantic equality (catalog seeds vs Tiptap HTML). */
export function extractRichTextContent(html: string | undefined): string {
  const trimmed = (html ?? '').trim()
  if (trimmed === '') return ''

  return trimmed
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function richTextHtmlEquals(a: string | undefined, b: string | undefined): boolean {
  if (normalizeRichTextHtml(a) === normalizeRichTextHtml(b)) return true
  return extractRichTextContent(a) === extractRichTextContent(b)
}

const BLOCK_HTML_PATTERN = /<(p|h[1-6]|ul|ol|li|div|blockquote|pre|table|br)\b/i

/** Whether a stored string looks like TipTap / rich-text HTML rather than markdown. */
export function looksLikeRichTextHtml(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '') return false
  if (/^\s*</.test(trimmed)) return true
  return BLOCK_HTML_PATTERN.test(trimmed)
}
