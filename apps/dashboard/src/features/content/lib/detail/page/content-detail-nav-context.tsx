import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { InPageNavSection } from '@/lib/in-page-nav/in-page-nav.types'

type SectionRecord = {
  label: string
  order: number
  leaves: Map<string, { label: string; order: number }>
}

type ContentDetailNavContextValue = {
  registerSection: (id: string, label: string) => () => void
  registerLeaf: (sectionId: string, id: string, label: string) => () => void
  sections: readonly InPageNavSection[]
}

const ContentDetailNavContext = createContext<ContentDetailNavContextValue | null>(null)

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

        const order = leafOrderRef.current
        leafOrderRef.current += 1
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

const noopUnregister = () => undefined

const noopRegistration = {
  registerSection: () => noopUnregister,
  registerLeaf: () => noopUnregister,
  sections: [] as const,
}

export function useContentDetailNavRegistration() {
  return useContext(ContentDetailNavContext) ?? noopRegistration
}

/** Read merged nav sections without registering — safe outside provider (returns empty). */
export function useContentDetailNavSections(): readonly InPageNavSection[] {
  return useContext(ContentDetailNavContext)?.sections ?? []
}
