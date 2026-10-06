import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { OrganizationPractice } from '@rpg/contracts'

import type { OrganizationFormPresentation } from '../../lib/organization-form-presentation.lib'
import { OrganizationAuthoringContext } from './use-organization-authoring-context'

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
