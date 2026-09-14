import { useEffect, useMemo, useState } from 'react'

import type { RulesConfigNavSection } from '@/features/campaign'

import {
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
            ratio: 0,
          },
        ]
      })

      const next = resolveActiveNavFromEntries(entries)
      setActiveSectionId(next.activeSectionId)
      setActiveLeafId(next.activeLeafId)
    }

    updateActive()
    const onScroll = () => updateActive()
    const onResize = () => updateActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    const retryTimer = window.setInterval(() => {
      const found = anchors.filter((anchor) => document.getElementById(anchor.id)).length
      if (found === anchors.length) {
        window.clearInterval(retryTimer)
        updateActive()
      }
    }, 100)

    return () => {
      window.clearInterval(retryTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [anchors])

  return { activeSectionId, activeLeafId }
}
