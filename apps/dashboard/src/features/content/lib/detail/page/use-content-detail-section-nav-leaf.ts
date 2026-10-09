import { createContext, useContext, useLayoutEffect } from 'react'

import { useContentDetailNavRegistration } from './content-detail-nav-registration'

export const ContentDetailSectionScopeContext = createContext<string | null>(null)

/** Registers an in-page nav leaf under the current section (no visible chrome). */
export function useContentDetailSectionNavLeaf(id: string, label: string) {
  const sectionId = useContext(ContentDetailSectionScopeContext)
  const { registerLeaf } = useContentDetailNavRegistration()

  useLayoutEffect(() => {
    if (!sectionId) return undefined
    return registerLeaf(sectionId, id, label)
  }, [id, label, registerLeaf, sectionId])

  if (!sectionId) {
    throw new Error('useContentDetailSectionNavLeaf must be used inside ContentDetailSection')
  }
}
