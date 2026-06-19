/** Matches top-level `<p>...</p>` blocks in feature description HTML. */
const PARAGRAPH_PATTERN = /<p\b[^>]*>[\s\S]*?<\/p>/gi

function extractParagraphs(html: string): string[] {
  return html.match(PARAGRAPH_PATTERN) ?? []
}

function stripParagraphWrapper(paragraph: string): string {
  return paragraph.replace(/^<p\b[^>]*>/i, '').replace(/<\/p>$/i, '')
}

/**
 * Composes SRD-style feature HTML from structured fields. Stored descriptions
 * are body-only; the `Level N: Name` heading is derived at render time.
 */
export function formatFeatureHtml(level: number, name: string, description?: string): string {
  const heading = `<strong>Level ${level}: ${name}</strong>`

  if (description === undefined || description.trim() === '') {
    return `<p>${heading}</p>`
  }

  const trimmed = description.trim()
  const paragraphs = extractParagraphs(trimmed)

  if (paragraphs.length === 0) {
    return `<p>${heading} ${trimmed}</p>`
  }

  if (paragraphs.length === 1) {
    const paragraph = paragraphs[0]!
    return `<p>${heading} ${stripParagraphWrapper(paragraph)}</p>`
  }

  return `<p>${heading}</p>${paragraphs.join('')}`
}
