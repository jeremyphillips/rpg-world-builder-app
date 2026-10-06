import { createContext, useContext } from 'react'
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

export const OrganizationAuthoringContext = createContext<OrganizationAuthoringContextValue | null>(
  null,
)

export function useOrganizationAuthoringContext(): OrganizationAuthoringContextValue {
  const context = useContext(OrganizationAuthoringContext)
  if (!context) {
    throw new Error(
      'useOrganizationAuthoringContext must be used within OrganizationAuthoringProvider',
    )
  }
  return context
}
