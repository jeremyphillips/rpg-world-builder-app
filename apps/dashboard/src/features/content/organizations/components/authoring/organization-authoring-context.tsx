import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { OrganizationPractice } from '@rpg/contracts'

import type { OrganizationFormPresentation } from '../../lib/organization-form-presentation.lib'

type OrganizationAuthoringContextValue = {
  presentation: OrganizationFormPresentation
  hasEnteredProfileSetup: boolean
  enterProfileSetup: () => void
  editFamiliarTypeOpen: boolean
  openEditFamiliarType: () => void
  closeEditFamiliarType: () => void
  practiceRecommendations: OrganizationPractice[]
  setPracticeRecommendations: (ids: OrganizationPractice[]) => void
  clearPracticeRecommendations: () => void
}

const OrganizationAuthoringContext = createContext<OrganizationAuthoringContextValue | null>(null)

export function OrganizationAuthoringProvider({
  children,
  presentation = 'full',
}: {
  children: ReactNode
  presentation?: OrganizationFormPresentation
}) {
  const [practiceRecommendations, setPracticeRecommendationsState] = useState<
    OrganizationPractice[]
  >([])
  const [hasEnteredProfileSetup, setHasEnteredProfileSetup] = useState(
    () => presentation !== 'quick',
  )
  const [editFamiliarTypeOpen, setEditFamiliarTypeOpen] = useState(false)

  const enterProfileSetup = useCallback(() => {
    setHasEnteredProfileSetup(true)
  }, [])
  const openEditFamiliarType = useCallback(() => {
    setEditFamiliarTypeOpen(true)
  }, [])
  const closeEditFamiliarType = useCallback(() => {
    setEditFamiliarTypeOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      presentation,
      hasEnteredProfileSetup,
      enterProfileSetup,
      editFamiliarTypeOpen,
      openEditFamiliarType,
      closeEditFamiliarType,
      practiceRecommendations,
      setPracticeRecommendations: setPracticeRecommendationsState,
      clearPracticeRecommendations: () => setPracticeRecommendationsState([]),
    }),
    [
      closeEditFamiliarType,
      editFamiliarTypeOpen,
      enterProfileSetup,
      hasEnteredProfileSetup,
      openEditFamiliarType,
      practiceRecommendations,
      presentation,
    ],
  )

  return (
    <OrganizationAuthoringContext.Provider value={value}>
      {children}
    </OrganizationAuthoringContext.Provider>
  )
}

export function useOrganizationAuthoringContext(): OrganizationAuthoringContextValue {
  const context = useContext(OrganizationAuthoringContext)
  if (!context) {
    throw new Error(
      'useOrganizationAuthoringContext must be used within OrganizationAuthoringProvider',
    )
  }
  return context
}
