/** Strips HTML tags and collapses whitespace for plain-text search/display fields. */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
