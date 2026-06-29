/** Plain-text content extracted from stored rich-text HTML (mirrors @rpg/ui/rich-text-html). */
export function extractRichTextPlainText(html: string | undefined): string {
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

/** Treat visually empty editor HTML as empty for agent-facing output. */
export function normalizeRichTextPlainText(html: string | undefined): string {
  const trimmed = (html ?? '').trim()
  if (trimmed === '') return ''

  return extractRichTextPlainText(trimmed) === '' ? '' : trimmed
}
