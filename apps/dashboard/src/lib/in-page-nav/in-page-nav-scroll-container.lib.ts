/** Marks the desktop in-page nav panel — excluded as a scroll root for anchor navigation. */
export const IN_PAGE_SECTION_NAV_PANEL_ATTR = 'data-in-page-section-nav-panel'

const NESTED_SCROLL_OFFSET_PX = 32

export type InPageNavScrollContainer = HTMLElement | 'document'

function isOverflowScrollableStyle(overflowY: string): boolean {
  return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
}

/** True when the element can scroll its own content (not the in-page nav rail). */
export function isInPageNavScrollContainer(element: HTMLElement): boolean {
  if (element.hasAttribute(IN_PAGE_SECTION_NAV_PANEL_ATTR)) {
    return false
  }

  const { overflowY } = getComputedStyle(element)
  if (!isOverflowScrollableStyle(overflowY)) {
    return false
  }

  return element.scrollHeight > element.clientHeight
}

/**
 * Nearest scrollport for an in-page anchor — modal body, workspace panel, or document.
 * Skips the in-page section nav panel so rail overflow does not capture scroll.
 */
export function resolveInPageNavScrollContainer(anchor: Element): InPageNavScrollContainer {
  let parent = anchor.parentElement

  while (parent) {
    if (isInPageNavScrollContainer(parent)) {
      return parent
    }
    parent = parent.parentElement
  }

  return 'document'
}

export function resolveInPageNavScrollOffsetPxForContainer(
  container: InPageNavScrollContainer,
  documentScrollOffsetPx: number,
): number {
  return container === 'document' ? documentScrollOffsetPx : NESTED_SCROLL_OFFSET_PX
}
