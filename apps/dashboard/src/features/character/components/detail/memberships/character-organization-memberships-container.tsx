import { useMemo } from 'react'

import { isContentPlayableFor } from '@rpg/contracts'

import type { OrganizationMembershipSelection } from '../../connections/picker/organization-picker-drawer.types'

import { useOrganizations } from '@/features/content'

import { CharacterControlledRelationshipField } from '../../relationship/character-controlled-relationship-field'
import { CharacterOrganizationMembershipDrawers } from './character-organization-membership-drawers'
import { useCharacterOrganizationMembershipsSheet } from '../../../hooks/use-character-organization-memberships-sheet'
import type { CharacterOrganizationMembershipSubjectKind } from '../../../lib/invalidate-character-organization-membership-queries'
import {
  buildCharacterApiRelationshipFieldContext,
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RELATIONSHIP_FIELD_REGISTRY,
} from '../../../lib/relationship/character-relationship-field-registry'

export type CharacterOrganizationMembershipsContainerProps = {
  campaignId: string
  characterId: string
  characterName: string
  canEdit: boolean
  subjectKind: CharacterOrganizationMembershipSubjectKind
}

/** Owns membership queries, mutations, and chooser/editor drawers for campaign sheets. */
export function CharacterOrganizationMembershipsContainer({
  campaignId,
  characterId,
  characterName,
  canEdit,
  subjectKind,
}: CharacterOrganizationMembershipsContainerProps) {
  const sheet = useCharacterOrganizationMembershipsSheet({
    campaignId,
    characterId,
    characterName,
    canEdit,
    subjectKind,
  })
  const organizationsQuery = useOrganizations(canEdit ? campaignId : undefined)

  const relationshipContext = useMemo(() => {
    const availableOrganizations = (organizationsQuery.data ?? []).filter((organization) =>
      isContentPlayableFor(organization, { kind: 'pc', characterId }),
    )
    const organizationsById = new Map(
      (organizationsQuery.data ?? []).map((organization) => [organization.id, organization]),
    )

    return buildCharacterApiRelationshipFieldContext({
      campaignId,
      availableOrganizations,
      eligibleResidenceLocations: [],
      organizationsById,
      locationsById: new Map(),
      availableOrganizationIdSet: new Set(availableOrganizations.map(({ id }) => id)),
      availableResidenceIdSet: new Set(),
      onEditMembership: canEdit ? sheet.setEditingMembership : undefined,
      onRemoveUnresolvedMembership: canEdit ? sheet.setUnresolvedToRemove : undefined,
    })
  }, [
    campaignId,
    canEdit,
    characterId,
    organizationsQuery.data,
    sheet.setEditingMembership,
    sheet.setUnresolvedToRemove,
  ])

  if (sheet.isBootstrapping) return null

  return (
    <>
      <CharacterControlledRelationshipField
        vocabulary={CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY}
        registry={CHARACTER_RELATIONSHIP_FIELD_REGISTRY}
        context={relationshipContext}
        label="Organizations"
        emptyItemLabel="organization"
        addActionLabel="Add organization"
        items={sheet.memberships}
        disabled={!canEdit}
        onAdd={(selection) => sheet.handleAdd(selection as OrganizationMembershipSelection)}
        onRemove={() => undefined}
      />
      {canEdit ? (
        <CharacterOrganizationMembershipDrawers
          characterName={characterName}
          editingMembership={sheet.editingMembership}
          editingOrganization={sheet.editingOrganization}
          onEditingOpenChange={(open) => {
            if (!open) sheet.setEditingMembership(null)
          }}
          onSave={sheet.handleSave}
          onRemove={sheet.handleRemove}
          unresolvedToRemove={sheet.unresolvedToRemove}
          unresolvedRemoveHeadline={sheet.unresolvedRemoveHeadline}
          onUnresolvedOpenChange={(open) => {
            if (!open) sheet.setUnresolvedToRemove(null)
          }}
          onRemoveUnresolved={sheet.handleRemoveUnresolved}
        />
      ) : null}
    </>
  )
}
