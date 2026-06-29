import { extractRichTextPlainText } from './rich-text-plain'

const BLOCK_HTML_PATTERN = /<(p|h[1-6]|ul|ol|li|div|blockquote|pre|table|br)\b/i

/** Whether a stored string looks like TipTap / rich-text HTML rather than markdown. */
export function looksLikeRichTextHtml(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '') return false
  if (/^\s*</.test(trimmed)) return true
  return BLOCK_HTML_PATTERN.test(trimmed)
}

/** Trim markdown field input; empty strings become `undefined` for API payloads. */
export function normalizeMarkdownField(value: string | undefined): string | undefined {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Maps stored ticket description to form textarea value. Legacy HTML is converted
 * to plain text on first open; markdown and plain text pass through unchanged.
 */
export function descriptionForMarkdownForm(stored: string | undefined): string {
  const trimmed = (stored ?? '').trim()
  if (trimmed === '') return ''
  if (looksLikeRichTextHtml(trimmed)) {
    return extractRichTextPlainText(trimmed)
  }
  return trimmed
}
