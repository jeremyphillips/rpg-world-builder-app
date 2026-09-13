import { useEffect, useMemo, useState } from 'react'

import type { RulesConfigNavSection } from '@/features/campaign'

import {
  buildRulesConfigNavObserverRootMargin,
  collectNavScrollSpyAnchors,
  measureAnchorTopRelativeToViewport,
  resolveActiveNavFromEntries,
  resolveRulesConfigNavScrollOffsetPx,
  type NavScrollSpyEntry,
} from './use-rules-config-nav-scroll-spy.lib'

export function useRulesConfigNavScrollSpy(sections: readonly RulesConfigNavSection[]) {
  const anchors = useMemo(() => collectNavScrollSpyAnchors(sections), [sections])
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>()
  const [activeLeafId, setActiveLeafId] = useState<string | undefined>()

  useEffect(() => {
    if (anchors.length === 0) return
    if (typeof IntersectionObserver === 'undefined') return

    const ratios = new Map<string, number>()

    const updateActive = () => {
      const scrollOffsetPx = resolveRulesConfigNavScrollOffsetPx()
      const entries: NavScrollSpyEntry[] = anchors.flatMap((anchor) => {
        const element = document.getElementById(anchor.id)
        if (!element) return []

        const top = measureAnchorTopRelativeToViewport(element, scrollOffsetPx)
        return [
          {
            ...anchor,
            top,
            ratio: ratios.get(anchor.id) ?? (top <= 0 ? 1 : 0),
          },
        ]
      })

      const next = resolveActiveNavFromEntries(entries)
      setActiveSectionId(next.activeSectionId)
      setActiveLeafId(next.activeLeafId)
    }

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          ratios.set(record.target.id, record.intersectionRatio)
        }
        updateActive()
      },
      {
        root: null,
        rootMargin: buildRulesConfigNavObserverRootMargin(),
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const anchor of anchors) {
      const element = document.getElementById(anchor.id)
      if (element) observer.observe(element)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [anchors])

  return { activeSectionId, activeLeafId }
}
