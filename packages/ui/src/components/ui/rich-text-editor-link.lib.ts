import { RICH_TEXT_LINK_ATTRS, readRichTextLinkAttr } from '../../lib/rich-text-link-attrs'
import type { RichTextLinkPickerValue } from './rich-text-link-picker.types'

export interface RichTextLinkMetadata {
  contentType?: string
  contentId?: string
  contentTitle?: string
  linkKind?: 'detail' | 'overview' | 'external'
}

export interface RichTextLinkContext {
  href: string
  displayText: string
  openInNewWindow: boolean
  metadata?: RichTextLinkMetadata
}

export function parseLinkKind(value: unknown): RichTextLinkMetadata['linkKind'] {
  if (value === 'detail' || value === 'overview' || value === 'external') return value
  return undefined
}

export function resolveLinkContextFromSelection(
  attrs: Record<string, unknown>,
  selectedText: string,
): RichTextLinkContext {
  return {
    href: typeof attrs.href === 'string' ? attrs.href : '',
    displayText:
      selectedText.trim() || readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentTitle) || '',
    openInNewWindow: attrs.target === '_blank',
    metadata: {
      contentType: readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentType),
      contentId: readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentId),
      contentTitle: readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.contentTitle),
      linkKind: parseLinkKind(readRichTextLinkAttr(attrs, RICH_TEXT_LINK_ATTRS.linkKind)),
    },
  }
}

export function buildLinkMarkAttributes(
  payload: RichTextLinkContext,
): Record<string, string | null> {
  const attributes: Record<string, string | null> = {
    href: payload.href.trim(),
    target: payload.openInNewWindow ? '_blank' : null,
    rel: payload.openInNewWindow ? 'noopener noreferrer' : null,
  }

  const metadata = payload.metadata
  if (metadata?.contentType) attributes[RICH_TEXT_LINK_ATTRS.contentType] = metadata.contentType
  if (metadata?.contentId) attributes[RICH_TEXT_LINK_ATTRS.contentId] = metadata.contentId
  if (metadata?.contentTitle) attributes[RICH_TEXT_LINK_ATTRS.contentTitle] = metadata.contentTitle
  if (metadata?.linkKind) attributes[RICH_TEXT_LINK_ATTRS.linkKind] = metadata.linkKind

  return attributes
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

export function createFallbackLinkContext(href: string, text?: string): RichTextLinkContext {
  const external = isExternalHref(href)
  return {
    href,
    displayText: text ?? '',
    openInNewWindow: external,
    metadata: external ? { linkKind: 'external' } : undefined,
  }
}

export function resolveLinkPickerMode(
  context: RichTextLinkContext | null,
): RichTextLinkPickerValue['mode'] {
  if (context?.metadata?.linkKind === 'external') return 'external'
  if (isExternalHref(context?.href ?? '')) return 'external'
  return 'internal'
}

export function mergeLinkInsertPayload(
  value: RichTextLinkPickerValue,
  editingContext: RichTextLinkContext | null,
): RichTextLinkContext {
  return {
    href: value.href,
    displayText: value.displayText,
    openInNewWindow: value.openInNewWindow,
    metadata: {
      ...editingContext?.metadata,
      ...value.metadata,
    },
  }
}

export function resolveAnchorEditPosition(
  rootRect: DOMRect,
  anchorRect: DOMRect,
): { top: number; left: number } {
  return {
    top: Math.max(anchorRect.top - rootRect.top - 10, 0),
    left: Math.max(anchorRect.right - rootRect.left + 4, 0),
  }
}

export function resolveSelectionEditPosition(
  rootRect: DOMRect,
  coords: { top: number; right: number },
): { top: number; left: number } {
  return {
    top: Math.max(coords.top - rootRect.top - 10, 0),
    left: Math.max(coords.right - rootRect.left + 4, 0),
  }
}

export function findHoveredLinkAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof HTMLElement)) return null
  const anchor = target.closest('a')
  return anchor instanceof HTMLAnchorElement ? anchor : null
}

export function resolveLinkContextFromAnchor(anchor: HTMLAnchorElement): RichTextLinkContext {
  return resolveLinkContextFromSelection(
    {
      href: anchor.getAttribute('href'),
      target: anchor.getAttribute('target'),
      [RICH_TEXT_LINK_ATTRS.contentType]: anchor.getAttribute(RICH_TEXT_LINK_ATTRS.contentType),
      [RICH_TEXT_LINK_ATTRS.contentId]: anchor.getAttribute(RICH_TEXT_LINK_ATTRS.contentId),
      [RICH_TEXT_LINK_ATTRS.contentTitle]: anchor.getAttribute(RICH_TEXT_LINK_ATTRS.contentTitle),
      [RICH_TEXT_LINK_ATTRS.linkKind]: anchor.getAttribute(RICH_TEXT_LINK_ATTRS.linkKind),
    },
    anchor.textContent ?? '',
  )
}
