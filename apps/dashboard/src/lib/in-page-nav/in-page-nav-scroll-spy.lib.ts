import { appStickyChromeBlockSizeFallbackPx } from '@/components/layout/shell/app-shell.variants'

import type { InPageNavSection } from './in-page-nav.types'
import {
  resolveInPageNavScrollContainer,
  resolveInPageNavScrollOffsetPxForContainer,
  type InPageNavScrollContainer,
} from './in-page-nav-scroll-container.lib'

export type NavScrollSpyAnchor = {
  id: string
  sectionId: string
  isLeaf: boolean
}

export type NavScrollSpyEntry = NavScrollSpyAnchor & {
  /** Distance from viewport top after applying the scroll offset (smaller = higher on page). */
  top: number
  /** Intersection ratio from `IntersectionObserver` when available. */
  ratio: number
}

/** Collects section and leaf anchor ids from derived navigation. */
export function collectNavScrollSpyAnchors(
  sections: readonly InPageNavSection[],
): NavScrollSpyAnchor[] {
  return sections.flatMap((section) => [
    { id: section.id, sectionId: section.id, isLeaf: false },
    ...(section.leaves?.map((leaf) => ({
      id: leaf.id,
      sectionId: section.id,
      isLeaf: true,
    })) ?? []),
  ])
}

/**
 * Picks the active section + optional leaf from anchor positions relative to the sticky offset.
 * Entries must be in document order (nav anchor order). Uses the last anchor at or above the
 * offset line — not the closest to the line — so earlier sections do not keep winning once a
 * later section has crossed. Before the first cross, highlights the nearest anchor below the line.
 */
export function resolveActiveNavFromEntries(entries: readonly NavScrollSpyEntry[]): {
  activeSectionId?: string
  activeLeafId?: string
} {
  if (entries.length === 0) {
    return {}
  }

  let winner: NavScrollSpyEntry | undefined
  for (const entry of entries) {
    if (entry.top <= 0) {
      winner = entry
    }
  }

  if (!winner) {
    const nearestBelow = [...entries].sort((a, b) => a.top - b.top)[0]
    if (!nearestBelow) return {}
    return nearestBelow.isLeaf
      ? { activeSectionId: nearestBelow.sectionId, activeLeafId: nearestBelow.id }
      : { activeSectionId: nearestBelow.id }
  }

  return winner.isLeaf
    ? { activeSectionId: winner.sectionId, activeLeafId: winner.id }
    : { activeSectionId: winner.id }
}

/** Reads sticky app chrome block size for scroll-spy offset (document scroll). */
export function resolveStickyChromeBlockSizePx(): number {
  const chrome = document.querySelector('[data-app-sticky-chrome]')
  if (chrome instanceof HTMLElement) {
    return chrome.getBoundingClientRect().height
  }

  return appStickyChromeBlockSizeFallbackPx
}

/** Default offset below sticky chrome + anchor scroll margin. */
export function resolveInPageNavScrollOffsetPx(): number {
  return resolveStickyChromeBlockSizePx() + 32
}

export function buildInPageNavObserverRootMargin(
  scrollOffsetPx = resolveInPageNavScrollOffsetPx(),
) {
  return `-${scrollOffsetPx}px 0px -55% 0px`
}

/** Distance from the scrollport top after applying the nav offset. */
export function measureAnchorTopRelativeToViewport(
  element: Element,
  scrollOffsetPx = resolveInPageNavScrollOffsetPx(),
  scrollContainer?: InPageNavScrollContainer,
): number {
  const container = scrollContainer ?? resolveInPageNavScrollContainer(element)
  const offset = resolveInPageNavScrollOffsetPxForContainer(container, scrollOffsetPx)

  if (container === 'document') {
    return element.getBoundingClientRect().top - offset
  }

  return element.getBoundingClientRect().top - container.getBoundingClientRect().top - offset
}

export function resolveInPageNavScrollTarget(
  container: InPageNavScrollContainer,
): HTMLElement | Window {
  return container === 'document' ? window : container
}
