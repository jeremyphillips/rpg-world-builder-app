import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import type { InPageNavSection } from '@/lib/in-page-nav/in-page-nav.types'

import { ContentDetailNavContext } from './content-detail-nav-registration'

type SectionRecord = {
  label: string
  order: number
  leaves: Map<string, { label: string; order: number }>
}

function buildNavSections(store: Map<string, SectionRecord>): InPageNavSection[] {
  return [...store.entries()]
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([id, section]) => {
      const leaves = [...section.leaves.entries()]
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([leafId, leaf]) => ({ id: leafId, label: leaf.label }))
      return {
        id,
        label: section.label,
        ...(leaves.length > 0 ? { leaves } : {}),
      }
    })
}

export function ContentDetailNavProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef(new Map<string, SectionRecord>())
  const orderRef = useRef(0)
  const leafOrderRef = useRef(0)
  /** Stable leaf order across effect cleanup/re-register (e.g. label edits). */
  const leafOrderByIdRef = useRef(new Map<string, number>())
  const [sections, setSections] = useState<readonly InPageNavSection[]>([])

  const syncSections = useCallback(() => {
    setSections(buildNavSections(storeRef.current))
  }, [])

  const registerSection = useCallback(
    (id: string, label: string) => {
      const existing = storeRef.current.get(id)
      const order = existing?.order ?? orderRef.current
      if (!existing) {
        orderRef.current += 1
      }
      storeRef.current.set(id, {
        label,
        order,
        leaves: existing?.leaves ?? new Map(),
      })
      syncSections()

      return () => {
        storeRef.current.delete(id)
        syncSections()
      }
    },
    [syncSections],
  )

  const registerLeaf = useCallback(
    (sectionId: string, id: string, label: string) => {
      const attachLeaf = () => {
        const section = storeRef.current.get(sectionId)
        if (!section) return false

        let order = leafOrderByIdRef.current.get(id)
        if (order === undefined) {
          order = leafOrderRef.current
          leafOrderRef.current += 1
          leafOrderByIdRef.current.set(id, order)
        }
        section.leaves.set(id, { label, order })
        syncSections()
        return true
      }

      if (!attachLeaf()) {
        queueMicrotask(() => {
          attachLeaf()
        })
      }

      return () => {
        const section = storeRef.current.get(sectionId)
        section?.leaves.delete(id)
        syncSections()
      }
    },
    [syncSections],
  )

  const value = useMemo(
    () => ({
      registerSection,
      registerLeaf,
      sections,
    }),
    [registerLeaf, registerSection, sections],
  )

  return (
    <ContentDetailNavContext.Provider value={value}>{children}</ContentDetailNavContext.Provider>
  )
}
