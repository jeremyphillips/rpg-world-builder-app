import { useMemo } from 'react'

import type { ResidenceLocationSelection } from '../../connections/picker/residence-location-picker-drawer.types'
import { CharacterControlledRelationshipField } from '../../relationship/character-controlled-relationship-field'
import { useCharacterResidenceSheet } from '../../../hooks/use-character-residence-sheet'
import type { CharacterOrganizationMembershipSubjectKind } from '../../../lib/invalidate-character-organization-membership-queries'
import {
  buildCharacterApiRelationshipFieldContext,
  CHARACTER_RELATIONSHIP_FIELD_REGISTRY,
  CHARACTER_RESIDENCE_VOCABULARY,
} from '../../../lib/relationship/character-relationship-field-registry'
import { RESIDENCE_CONNECTION_KIND } from '../../../lib/connections/residence-location-connection.lib'

export type CharacterResidenceContainerProps = {
  campaignId: string
  characterId: string
  canEdit: boolean
  subjectKind: CharacterOrganizationMembershipSubjectKind
}

/** Owns residence queries, mutations, and picker drawer for campaign character sheets. */
export function CharacterResidenceContainer({
  campaignId,
  characterId,
  canEdit,
  subjectKind,
}: CharacterResidenceContainerProps) {
  const sheet = useCharacterResidenceSheet({
    campaignId,
    characterId,
    canEdit,
    subjectKind,
  })

  const residences = useMemo(
    () =>
      sheet.locationReferences.filter(
        ({ connection }) => connection.kind === RESIDENCE_CONNECTION_KIND,
      ),
    [sheet.locationReferences],
  )

  const relationshipContext = useMemo(() => {
    const eligibleResidenceLocations = sheet.pickerItems.map(({ location }) => location)
    const locationsById = new Map(
      eligibleResidenceLocations.map((location) => [location.id, location]),
    )

    return buildCharacterApiRelationshipFieldContext({
      campaignId,
      availableOrganizations: [],
      eligibleResidenceLocations,
      organizationsById: new Map(),
      locationsById,
      availableOrganizationIdSet: new Set(),
      availableResidenceIdSet: new Set(eligibleResidenceLocations.map(({ id }) => id)),
    })
  }, [campaignId, sheet.pickerItems])

  if (sheet.isBootstrapping) return null

  return (
    <CharacterControlledRelationshipField
      vocabulary={CHARACTER_RESIDENCE_VOCABULARY}
      registry={CHARACTER_RELATIONSHIP_FIELD_REGISTRY}
      context={relationshipContext}
      label="Residence"
      emptyLabel="None"
      addActionLabel="Add residence"
      items={residences}
      disabled={!canEdit}
      onAdd={(selection) => sheet.handleAdd(selection as ResidenceLocationSelection)}
      onRemove={(reference) => {
        void sheet.handleRemove(reference.connection.id, reference.connection.locationId)
      }}
    />
  )
}
