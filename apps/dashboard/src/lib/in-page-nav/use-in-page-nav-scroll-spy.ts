import { useEffect, useMemo, useState } from 'react'

import type { InPageNavSection } from './in-page-nav.types'
import { resolveInPageNavScrollContainer } from './in-page-nav-scroll-container.lib'
import {
  collectNavScrollSpyAnchors,
  measureAnchorTopRelativeToViewport,
  resolveActiveNavFromEntries,
  resolveInPageNavScrollOffsetPx,
  resolveInPageNavScrollTarget,
  type NavScrollSpyEntry,
} from './in-page-nav-scroll-spy.lib'

export function useInPageNavScrollSpy(sections: readonly InPageNavSection[]) {
  const anchors = useMemo(() => collectNavScrollSpyAnchors(sections), [sections])
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>()
  const [activeLeafId, setActiveLeafId] = useState<string | undefined>()

  useEffect(() => {
    if (anchors.length === 0) return

    let scrollContainer: ReturnType<typeof resolveInPageNavScrollContainer> = 'document'
    let scrollTarget: HTMLElement | Window = window

    const onScroll = () => updateActive()

    const syncScrollListener = () => {
      const nextTarget = resolveInPageNavScrollTarget(scrollContainer)
      if (nextTarget === scrollTarget) return
      scrollTarget.removeEventListener('scroll', onScroll)
      scrollTarget = nextTarget
      scrollTarget.addEventListener('scroll', onScroll, { passive: true })
    }

    const updateActive = () => {
      const scrollOffsetPx = resolveInPageNavScrollOffsetPx()
      const entries: NavScrollSpyEntry[] = anchors.flatMap((anchor) => {
        const element = document.getElementById(anchor.id)
        if (!element) return []

        scrollContainer = resolveInPageNavScrollContainer(element)
        const top = measureAnchorTopRelativeToViewport(element, scrollOffsetPx, scrollContainer)
        return [
          {
            ...anchor,
            top,
            ratio: 0,
          },
        ]
      })

      if (entries.length > 0) {
        syncScrollListener()
      }

      const next = resolveActiveNavFromEntries(entries)
      setActiveSectionId(next.activeSectionId)
      setActiveLeafId(next.activeLeafId)
    }

    scrollTarget.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => updateActive()
    window.addEventListener('resize', onResize)

    updateActive()

    const retryTimer = window.setInterval(() => {
      const found = anchors.filter((anchor) => document.getElementById(anchor.id)).length
      if (found === anchors.length) {
        window.clearInterval(retryTimer)
        updateActive()
      }
    }, 100)

    return () => {
      window.clearInterval(retryTimer)
      scrollTarget.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [anchors])

  return { activeSectionId, activeLeafId }
}
