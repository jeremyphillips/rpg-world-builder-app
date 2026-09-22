import { useCallback } from 'react'

import type { CharacterLocationReferenceResolution } from '@rpg/contracts'

import type { ResidenceLocationSelection } from '../../connections/picker/residence-location-picker-drawer.types'
import {
  areResidenceListsEqual,
  residencesToFormValues,
  type ResidenceFormValues,
} from '../../../lib/relationship/character-residence-form-fields'
import { useRelationshipApiSemanticSync } from '../../../lib/relationship/use-relationship-api-semantic-sync'

type CharacterResidenceApiSyncProps = {
  serverResidences: readonly CharacterLocationReferenceResolution[]
  onAdd: (selection: ResidenceLocationSelection) => void | Promise<void>
  onRemove: (connectionId: string, locationId: string) => void | Promise<void>
}

/** Commits residence array edits from RHF to the API sheet handlers. */
export function CharacterResidenceApiSync({
  serverResidences,
  onAdd,
  onRemove,
}: CharacterResidenceApiSyncProps) {
  const serverByLocationId = useCallback(
    () =>
      new Map(
        serverResidences.map((reference) => [
          reference.connection.locationId,
          reference.connection,
        ]),
      ),
    [serverResidences],
  )

  const handleRemove = useCallback(
    (locationId: string) => {
      const connection = serverByLocationId().get(locationId)
      if (!connection) {
        throw new Error('Could not remove this residence.')
      }
      return onRemove(connection.id, locationId)
    },
    [onRemove, serverByLocationId],
  )

  return useRelationshipApiSemanticSync<ResidenceFormValues, CharacterLocationReferenceResolution>({
    serverSnapshot: serverResidences,
    areServerEqual: areResidenceListsEqual,
    toFormValues: residencesToFormValues,
    formFieldName: 'locations',
    semanticIdKey: 'locationId',
    getConfirmedIds: (residences) => residences.map((reference) => reference.connection.locationId),
    onAdd: (locationId) => onAdd({ locationId }),
    onRemove: handleRemove,
    addErrorFallback: 'Could not add this residence.',
    removeErrorFallback: 'Could not remove this residence.',
  })
}
