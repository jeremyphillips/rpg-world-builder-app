import { useCallback, useMemo } from 'react'

import { Form } from '@rpg/ui/form'

import { CharacterResidenceApiSync } from './character-residence-api-sync'
import { useCharacterResidenceSheet } from '../../../hooks/use-character-residence-sheet'
import type { CharacterOrganizationMembershipSubjectKind } from '../../../lib/invalidate-character-organization-membership-queries'
import { RESIDENCE_CONNECTION_KIND } from '../../../lib/connections/residence-location-connection.lib'
import {
  mergeLocationsById,
  resolveAvailableResidenceIdSet,
} from '../../../lib/relationship/character-relationship-resolved-entities.lib'
import {
  buildCharacterApiRelationshipFieldContext,
  CharacterApiRelationshipFormProvider,
} from '../../../lib/relationship/character-relationship-field-registry'
import {
  buildResidenceFormFields,
  residenceFormSchema,
  residencesToFormValues,
} from '../../../lib/relationship/character-residence-form-fields'

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

    return buildCharacterApiRelationshipFieldContext({
      campaignId,
      availableOrganizations: [],
      eligibleResidenceLocations,
      locationsQueryStatus: sheet.locationsQueryStatus,
      organizationsById: new Map(),
      locationsById: mergeLocationsById(sheet.locations, residences),
      availableOrganizationIdSet: new Set(),
      availableResidenceIdSet: resolveAvailableResidenceIdSet({
        canEdit,
        eligibleLocationIds: eligibleResidenceLocations.map(({ id }) => id),
        residences,
      }),
    })
  }, [
    campaignId,
    canEdit,
    residences,
    sheet.locations,
    sheet.locationsQueryStatus,
    sheet.pickerItems,
  ])

  const renderApiSync = useCallback(
    () => (
      <CharacterResidenceApiSync
        serverResidences={residences}
        onAdd={sheet.handleAdd}
        onRemove={sheet.handleRemove}
      />
    ),
    [residences, sheet.handleAdd, sheet.handleRemove],
  )

  const fields = useMemo(
    () =>
      buildResidenceFormFields({
        relationshipContext,
        disabled: !canEdit,
        renderApiSync,
      }),
    [canEdit, relationshipContext, renderApiSync],
  )

  const defaultValues = useMemo(() => residencesToFormValues(residences), [residences])

  const formKey = `${subjectKind}:${characterId}`

  if (sheet.isBootstrapping) return null

  return (
    <CharacterApiRelationshipFormProvider context={relationshipContext}>
      <Form
        key={formKey}
        schema={residenceFormSchema}
        fields={fields}
        defaultValues={defaultValues}
        mode="onChange"
        onSubmit={() => undefined}
      />
    </CharacterApiRelationshipFormProvider>
  )
}
