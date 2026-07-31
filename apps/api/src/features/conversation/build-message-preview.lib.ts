export const DIRECT_MESSAGE_PREVIEW_MAX_LENGTH = 120

/** Normalizes whitespace and truncates message text for list/notification previews. */
export function buildMessagePreview(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= DIRECT_MESSAGE_PREVIEW_MAX_LENGTH) return normalized
  return `${normalized.slice(0, DIRECT_MESSAGE_PREVIEW_MAX_LENGTH - 1)}…`
}
