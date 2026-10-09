import { createContext, useContext } from 'react'

import type { InPageNavSection } from '@/lib/in-page-nav/in-page-nav.types'

type ContentDetailNavContextValue = {
  registerSection: (id: string, label: string) => () => void
  registerLeaf: (sectionId: string, id: string, label: string) => () => void
  sections: readonly InPageNavSection[]
}

export const ContentDetailNavContext = createContext<ContentDetailNavContextValue | null>(null)

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
