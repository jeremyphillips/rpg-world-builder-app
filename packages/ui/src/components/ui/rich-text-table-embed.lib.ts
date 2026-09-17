import { sanitizeHtml } from '../../lib/sanitize-html'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '../../lib/rich-text-table-embed-attrs'

const TABLE_EMBED_SELECTOR = `div[${RICH_TEXT_TABLE_EMBED_ATTR}]`

function extractTableEmbedIdsWithRegex(html: string): string[] {
  const pattern = new RegExp(`${RICH_TEXT_TABLE_EMBED_ATTR}="([^"]+)"`, 'g')
  const ids: string[] = []

  for (const match of html.matchAll(pattern)) {
    const id = match[1]?.trim()
    if (id) ids.push(id)
  }

  return ids
}

function extractTableEmbedIdsFromDocument(html: string): string[] {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const ids: string[] = []

  document.body.querySelectorAll(TABLE_EMBED_SELECTOR).forEach((element) => {
    const id = element.getAttribute(RICH_TEXT_TABLE_EMBED_ATTR)?.trim()
    if (id) ids.push(id)
  })

  return ids
}

/** Collects table embed ids from description HTML (DOM when available, regex fallback in node). */
export function extractTableEmbedIds(html: string): string[] {
  if (html.trim() === '') return []

  let sanitized = html
  try {
    sanitized = sanitizeHtml(html)
  } catch {
    return extractTableEmbedIdsWithRegex(html)
  }

  if (typeof DOMParser === 'undefined') {
    return extractTableEmbedIdsWithRegex(sanitized)
  }

  try {
    return extractTableEmbedIdsFromDocument(sanitized)
  } catch {
    return extractTableEmbedIdsWithRegex(sanitized)
  }
}

/** Fast presence check for normalization — avoids DOMPurify in node-only test runs. */
export function richTextHtmlHasTableEmbeds(html: string | undefined): boolean {
  const trimmed = (html ?? '').trim()
  if (trimmed === '') return false
  return trimmed.includes(RICH_TEXT_TABLE_EMBED_ATTR)
}
