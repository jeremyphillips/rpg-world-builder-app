import { pageScrollContainerSelector } from '@/components/layout/page/page-scroll.variants'

import type { RulesConfigNavSection } from '@/features/campaign'

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
 * Picks the active section + optional leaf from visible anchor entries.
 * Prefers the highest visible leaf; otherwise the highest visible section.
 */
export function resolveActiveNavFromEntries(entries: readonly NavScrollSpyEntry[]): {
  activeSectionId?: string
  activeLeafId?: string
} {
  if (entries.length === 0) {
    return {}
  }

  const visible = entries.filter((entry) => entry.ratio > 0)
  if (visible.length === 0) {
    return {}
  }

  const sorted = [...visible].sort((a, b) => {
    if (a.top !== b.top) return a.top - b.top
    if (a.isLeaf !== b.isLeaf) return a.isLeaf ? -1 : 1
    return b.ratio - a.ratio
  })

  const activeLeaf = sorted.find((entry) => entry.isLeaf)
  if (activeLeaf) {
    return {
      activeSectionId: activeLeaf.sectionId,
      activeLeafId: activeLeaf.id,
    }
  }

  const activeSection = sorted.find((entry) => !entry.isLeaf)
  return activeSection ? { activeSectionId: activeSection.id } : {}
}

/** Default offset for page shell top inset + `scroll-mt-8` anchor margin. */
export const RULES_CONFIG_NAV_SCROLL_OFFSET_PX = 32

export function buildRulesConfigNavObserverRootMargin(
  scrollOffsetPx = RULES_CONFIG_NAV_SCROLL_OFFSET_PX,
) {
  return `-${scrollOffsetPx}px 0px -55% 0px`
}

/** Resolves the route page scrollport (`PageScrollShell`). */
export function resolvePageScrollContainer(): Element | null {
  return document.querySelector(pageScrollContainerSelector)
}

/** Distance from a scroll root's top edge after applying the nav offset. */
export function measureAnchorTopRelativeToScrollRoot(
  element: Element,
  scrollRoot: Element | null,
  scrollOffsetPx = RULES_CONFIG_NAV_SCROLL_OFFSET_PX,
): number {
  const elementRect = element.getBoundingClientRect()
  if (!scrollRoot) {
    return elementRect.top - scrollOffsetPx
  }

  const rootRect = scrollRoot.getBoundingClientRect()
  return elementRect.top - rootRect.top - scrollOffsetPx
}
