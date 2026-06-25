/** `data-*` attributes persisted on rich-text links for picker round-trip and display. */
export const RICH_TEXT_LINK_ATTRS = {
  contentType: 'data-content-type',
  contentId: 'data-content-id',
  contentTitle: 'data-content-title',
  linkKind: 'data-link-kind',
} as const

/** Attribute names passed to DOMPurify `ADD_ATTR` when sanitizing stored rich text. */
export const RICH_TEXT_LINK_SANITIZE_ATTRS = Object.values(RICH_TEXT_LINK_ATTRS)

export type RichTextLinkAttrName = (typeof RICH_TEXT_LINK_ATTRS)[keyof typeof RICH_TEXT_LINK_ATTRS]

export function readRichTextLinkAttr(
  attrs: Record<string, unknown>,
  key: RichTextLinkAttrName,
): string | undefined {
  const value = attrs[key]
  return typeof value === 'string' ? value : undefined
}
