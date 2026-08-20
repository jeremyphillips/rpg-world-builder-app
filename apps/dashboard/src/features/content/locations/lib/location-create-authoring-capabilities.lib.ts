import type { ContentCreateContext } from '@/lib/create-flow/content-create-context'

import type { LocationAuthoringType } from './location-authoring-type'

export const LOCATION_CREATE_AUTHORING_TAB_IDS = ['details', 'organizations'] as const

export type LocationCreateAuthoringTabId = (typeof LOCATION_CREATE_AUTHORING_TAB_IDS)[number]

export type LocationCreateAuthoringCapabilities = {
  tabs: readonly LocationCreateAuthoringTabId[]
  organizationComposition: boolean
}

function isOrganizationLocationCompositionSuppressed(createContext: ContentCreateContext): boolean {
  return (
    createContext.kind === 'relationship-target' &&
    createContext.relationshipVocabulary === 'organization_location_connection'
  )
}

export function resolveLocationCreateAuthoringCapabilities(input: {
  authoringType: LocationAuthoringType
  createContext: ContentCreateContext
}): LocationCreateAuthoringCapabilities {
  const organizationComposition =
    input.authoringType === 'building' &&
    !isOrganizationLocationCompositionSuppressed(input.createContext)

  return {
    organizationComposition,
    tabs: organizationComposition ? ['details', 'organizations'] : ['details'],
  }
}
