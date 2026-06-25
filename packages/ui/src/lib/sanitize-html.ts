import DOMPurify, { type Config } from 'dompurify'

import { RICH_TEXT_LINK_SANITIZE_ATTRS } from './rich-text-link-attrs'

const SANITIZE_CONFIG: Config = {
  ADD_ATTR: [...RICH_TEXT_LINK_SANITIZE_ATTRS, 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
}

/**
 * Sanitize an HTML string produced by the rich-text editor before rendering it.
 * Rich text is stored as an HTML string, so any surface that displays stored
 * content MUST pass it through here rather than dropping raw HTML into
 * `dangerouslySetInnerHTML`.
 *
 * Internal links keep canonical relative `href` values plus approved `data-*`
 * metadata attributes for link-picker round-trip; other `data-*` attrs are stripped.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}
