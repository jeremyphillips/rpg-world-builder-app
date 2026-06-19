/** Matches top-level `<p>...</p>` blocks in feature description HTML. */
const PARAGRAPH_PATTERN = /<p\b[^>]*>[\s\S]*?<\/p>/gi

function extractParagraphs(html: string): string[] {
  return html.match(PARAGRAPH_PATTERN) ?? []
}

/**
 * Normalizes stored feature description HTML for `RichTextContent`. Headings
 * (`Level N: Name`) are rendered separately via `Heading`, not in this string.
 */
export function formatFeatureDescriptionHtml(description?: string): string | undefined {
  if (description === undefined || description.trim() === '') {
    return undefined
  }

  const trimmed = description.trim()
  const paragraphs = extractParagraphs(trimmed)

  if (paragraphs.length === 0) {
    return `<p>${trimmed}</p>`
  }

  return paragraphs.join('')
}
