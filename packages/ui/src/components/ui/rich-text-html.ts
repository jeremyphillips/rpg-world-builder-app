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
