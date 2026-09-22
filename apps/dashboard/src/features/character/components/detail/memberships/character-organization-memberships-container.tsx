import { useCallback, useMemo } from 'react'

import { isContentPlayableFor } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { useOrganizations } from '@/features/content'

import { CharacterOrganizationMembershipDrawers } from './character-organization-membership-drawers'
import { OrganizationMembershipsApiSync } from './organization-memberships-api-sync'
import { useCharacterOrganizationMembershipsSheet } from '../../../hooks/use-character-organization-memberships-sheet'
import type { CharacterOrganizationMembershipSubjectKind } from '../../../lib/invalidate-character-organization-membership-queries'
import { resolveRelationshipPlayActor } from '../../../lib/relationship/character-relationship-play-actor.lib'
import {
  mergeOrganizationsById,
  resolveAvailableOrganizationIdSet,
} from '../../../lib/relationship/character-relationship-resolved-entities.lib'
import {
  buildOrganizationMembershipsFormFields,
  organizationMembershipsFormSchema,
  organizationMembershipsToFormValues,
} from '../../../lib/relationship/character-organization-memberships-form-fields'
import {
  buildCharacterApiRelationshipFieldContext,
  CharacterApiRelationshipFormProvider,
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

  const playActor = useMemo(
    () => resolveRelationshipPlayActor(subjectKind, characterId),
    [characterId, subjectKind],
  )

  const relationshipContext = useMemo(() => {
    const catalogOrganizations = organizationsQuery.data ?? []
    const availableOrganizations = catalogOrganizations.filter((organization) =>
      isContentPlayableFor(organization, playActor),
    )

    return buildCharacterApiRelationshipFieldContext({
      campaignId,
      availableOrganizations,
      eligibleResidenceLocations: [],
      locationsQueryStatus: { status: 'idle' },
      organizationsById: mergeOrganizationsById(catalogOrganizations, sheet.memberships),
      locationsById: new Map(),
      availableOrganizationIdSet: resolveAvailableOrganizationIdSet({
        canEdit,
        playableOrganizationIds: availableOrganizations.map(({ id }) => id),
        memberships: sheet.memberships,
      }),
      availableResidenceIdSet: new Set(),
      onEditMembership: canEdit ? sheet.setEditingMembership : undefined,
      onRemoveUnresolvedMembership: canEdit ? sheet.setUnresolvedToRemove : undefined,
      resolvedMemberships: sheet.memberships,
    })
  }, [
    campaignId,
    canEdit,
    organizationsQuery.data,
    playActor,
    sheet.memberships,
    sheet.setEditingMembership,
    sheet.setUnresolvedToRemove,
  ])

  const renderApiSync = useCallback(
    () => (
      <OrganizationMembershipsApiSync
        serverMemberships={sheet.memberships}
        onAdd={sheet.handleAdd}
      />
    ),
    [sheet.handleAdd, sheet.memberships],
  )

  const fields = useMemo(
    () =>
      buildOrganizationMembershipsFormFields({
        relationshipContext,
        disabled: !canEdit,
        renderApiSync,
      }),
    [canEdit, relationshipContext, renderApiSync],
  )

  const defaultValues = useMemo(
    () => organizationMembershipsToFormValues(sheet.memberships),
    [sheet.memberships],
  )

  const formKey = `${subjectKind}:${characterId}`

  if (sheet.isBootstrapping) return null

  return (
    <>
      <CharacterApiRelationshipFormProvider context={relationshipContext}>
        <Form
          key={formKey}
          schema={organizationMembershipsFormSchema}
          fields={fields}
          defaultValues={defaultValues}
          mode="onChange"
          onSubmit={() => undefined}
        />
      </CharacterApiRelationshipFormProvider>
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
