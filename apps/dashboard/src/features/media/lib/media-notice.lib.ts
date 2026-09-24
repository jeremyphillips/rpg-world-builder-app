export type MediaStatusNotice = { kind: 'text'; text: string }

export function textMediaStatusNotice(text: string): MediaStatusNotice {
  return { kind: 'text', text }
}

export function hasMediaStatusNotice(notice?: MediaStatusNotice | null): boolean {
  if (!notice) return false
  return notice.text.length > 0
}

export function resolveMediaStatusNotice(
  uploadNotice: string,
  sessionNotice: MediaStatusNotice | null,
): MediaStatusNotice | null {
  if (uploadNotice) return textMediaStatusNotice(uploadNotice)
  return sessionNotice
}
