import { Text } from '@rpg/ui'
import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'

import {
  areResidenceProjectionsEqual,
  residenceFormRowContentEqual,
  residenceProjectionToFormRow,
  residenceProjectionsToFormValues,
  type ResidenceFormRow,
} from '../../../lib/relationship/character-relationship-form-rows.lib'
import type { ResidenceFormValues } from '../../../lib/relationship/character-residence-form-fields'
import { useRelationshipEdgeApiSync } from '../../../lib/relationship/use-relationship-edge-api-sync'

type CharacterResidenceApiSyncProps = {
  serverResidences: readonly CharacterRelationshipProjectionRow[]
  onAdd: (locationId: string, idempotencyKey: string) => Promise<{ relationshipId: string } | void>
  onRemove: (
    relationshipId: string,
    expectedRevision: number,
    locationId: string,
  ) => void | Promise<void>
}

type ApiResidenceFormRow = ResidenceFormRow & { revision: number }

/** Commits residence array edits from RHF to the API sheet handlers. */
export function CharacterResidenceApiSync({
  serverResidences,
  onAdd,
  onRemove,
}: CharacterResidenceApiSyncProps) {
  const syncError = useRelationshipEdgeApiSync<
    ResidenceFormValues,
    CharacterRelationshipProjectionRow,
    ApiResidenceFormRow
  >({
    serverSnapshot: serverResidences,
    areServerEqual: areResidenceProjectionsEqual,
    toFormValues: residenceProjectionsToFormValues,
    toSnapshotRows: (rows) => rows,
    formFieldName: 'locations',
    getFormRows: (formValues) =>
      (formValues.locations ?? []).map((row) => ({
        ...row,
        revision: row.revision ?? 0,
      })),
    isRowContentEqual: (confirmed, desired) =>
      residenceFormRowContentEqual(residenceProjectionToFormRow(confirmed), desired),
    onAdd: async (op, row) => {
      if (!op.idempotencyKey) {
        throw new Error('Could not add this residence.')
      }
      return onAdd(row.locationId, op.idempotencyKey)
    },
    onUpdate: async () => {
      throw new Error('Could not update this residence.')
    },
    onRemove: async (op, row) => {
      const serverRow = serverResidences.find((item) => item.relationshipId === op.relationshipId)
      const locationId =
        serverRow?.target?.type === 'location'
          ? serverRow.target.id
          : 'locationId' in row
            ? row.locationId
            : ''
      const expectedRevision = op.expectedRevision ?? row.revision
      if (!locationId || expectedRevision === undefined) {
        throw new Error('Could not remove this residence.')
      }
      await onRemove(op.relationshipId, expectedRevision, locationId)
    },
    addErrorFallback: 'Could not add this residence.',
    removeErrorFallback: 'Could not remove this residence.',
  })

  return syncError ? (
    <Text variant="destructive" aria-live="polite">
      {syncError}
    </Text>
  ) : null
}
