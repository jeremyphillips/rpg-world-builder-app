import DOMPurify from 'dompurify'

/**
 * Sanitize an HTML string produced by the rich-text editor before rendering it.
 * Rich text is stored as an HTML string, so any surface that displays stored
 * content MUST pass it through here rather than dropping raw HTML into
 * `dangerouslySetInnerHTML`.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}
