import * as React from 'react'

import {
  getErrorMessage,
  type CharacterLocationReferenceResolution,
  type Location,
} from '@rpg/contracts'

import { useLocations } from '@/features/content'

import type { ResidenceLocationPickerItem } from '../components/connections/picker/residence-location-picker-drawer.types'
import type { ResidenceLocationSelection } from '../components/connections/picker/residence-location-picker-drawer.types'
import {
  filterResidenceEligibleLocations,
  RESIDENCE_CONNECTION_KIND,
} from '../lib/connections/residence-location-connection.lib'
import type { CharacterOrganizationMembershipSubjectKind } from '../lib/invalidate-character-organization-membership-queries'
import { useCharacterLocationReferences } from './use-character-location-references'
import { useCharacterResidenceMutations } from './use-character-residence-mutations'

function toPickerItems(
  locations: readonly Location[],
  references: readonly CharacterLocationReferenceResolution[],
): ResidenceLocationPickerItem[] {
  const selectedIds = new Set(
    references
      .filter(({ connection }) => connection.kind === RESIDENCE_CONNECTION_KIND)
      .map(({ connection }) => connection.locationId),
  )

  return filterResidenceEligibleLocations(locations).map((location) => ({
    location,
    selected: selectedIds.has(location.id),
  }))
}

function rethrowCanonicalized(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error, fallback))
}

export function useCharacterResidenceSheet(input: {
  campaignId: string
  characterId: string
  canEdit: boolean
  subjectKind: CharacterOrganizationMembershipSubjectKind
}) {
  const { campaignId, characterId, canEdit, subjectKind } = input
  const referencesQuery = useCharacterLocationReferences(campaignId, characterId)
  const locationsQuery = useLocations(canEdit ? campaignId : undefined)
  const mutations = useCharacterResidenceMutations(campaignId, characterId, subjectKind)
  const [pickerOpen, setPickerOpen] = React.useState(false)

  const locationReferences = React.useMemo(() => referencesQuery.data ?? [], [referencesQuery.data])

  const pickerItems = React.useMemo(
    () => toPickerItems(locationsQuery.data ?? [], locationReferences),
    [locationReferences, locationsQuery.data],
  )

  const handleAdd = React.useCallback(
    async (selection: ResidenceLocationSelection) => {
      try {
        await mutations.addResidence({
          locationId: selection.locationId,
          kind: RESIDENCE_CONNECTION_KIND,
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this residence.')
      }
    },
    [mutations],
  )

  const handleRemove = React.useCallback(
    async (connectionId: string, locationId: string) => {
      try {
        await mutations.removeResidence(connectionId, locationId)
      } catch {
        // Keep row visible for retry.
      }
    },
    [mutations],
  )

  return {
    isBootstrapping:
      (referencesQuery.isPending && referencesQuery.data === undefined) ||
      (canEdit && locationsQuery.isPending && locationsQuery.data === undefined),
    locationReferences,
    pickerOpen,
    setPickerOpen,
    pickerItems,
    handleAdd,
    handleRemove,
  }
}
