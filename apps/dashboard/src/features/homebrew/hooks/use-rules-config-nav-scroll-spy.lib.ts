import type { RulesConfigNavSection } from '@/features/campaign'
import { appStickyChromeBlockSizeFallbackPx } from '@/components/layout/shell/app-shell.variants'

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
  sections: readonly RulesConfigNavSection[],
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
export function resolveRulesConfigNavScrollOffsetPx(): number {
  return resolveStickyChromeBlockSizePx() + 32
}

export function buildRulesConfigNavObserverRootMargin(
  scrollOffsetPx = resolveRulesConfigNavScrollOffsetPx(),
) {
  return `-${scrollOffsetPx}px 0px -55% 0px`
}

/** Distance from the viewport top after applying the nav offset (document scroll). */
export function measureAnchorTopRelativeToViewport(
  element: Element,
  scrollOffsetPx = resolveRulesConfigNavScrollOffsetPx(),
): number {
  return element.getBoundingClientRect().top - scrollOffsetPx
}
