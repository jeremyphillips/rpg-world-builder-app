/** Matches top-level `<p>...</p>` blocks in feature description HTML. */
const PARAGRAPH_PATTERN = /<p\b[^>]*>[\s\S]*?<\/p>/gi

function extractParagraphs(html: string): string[] {
  return html.match(PARAGRAPH_PATTERN) ?? []
}

function featureHeading(level: number, name: string): string {
  return `<strong>Level ${level}: ${name}</strong>`
}

/**
 * Composes SRD-style feature HTML from structured fields. Stored descriptions
 * are body-only; the "Level N: Name" prefix is derived at render time.
 *
 * - No description → heading paragraph only
 * - One paragraph → merged heading + body in a single `<p>`
 * - Multiple paragraphs → heading `<p>` then body paragraphs unchanged
 */
export function formatFeatureHtml(level: number, name: string, description?: string): string {
  const heading = featureHeading(level, name)

  if (description === undefined || description.trim() === '') {
    return `<p>${heading}</p>`
  }

  const paragraphs = extractParagraphs(description.trim())

  if (paragraphs.length === 0) {
    return `<p>${heading} ${description.trim()}</p>`
  }

  if (paragraphs.length === 1) {
    const first = paragraphs[0]
    if (first === undefined) {
      return `<p>${heading} ${description.trim()}</p>`
    }
    const body = first.replace(/^<p\b[^>]*>/, '').replace(/<\/p>$/, '')
    return `<p>${heading} ${body}</p>`
  }

  return `<p>${heading}</p>${paragraphs.join('')}`
}
