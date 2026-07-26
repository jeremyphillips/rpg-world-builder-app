import type { BulkFieldOperation } from '../../../lib/bulk-field-operation'
import type { CharacterRosterStatus } from '../../vocab/character-roster-status'
import type { CharacterLifecycle } from './lifecycle'
import { createDefaultCharacterLifecycle } from './lifecycle'
import {
  mergeCharacterLifecyclePatch,
  type CharacterLifecyclePatch,
} from './update-character-lifecycle'

export type CharacterBulkRosterFormValues = {
  rosterStatus: BulkFieldOperation<CharacterRosterStatus>
}

export const CHARACTER_BULK_ROSTER_FORM_DEFAULT: CharacterBulkRosterFormValues = {
  rosterStatus: { kind: 'unchanged' },
}

function resolveBulkRosterStatus(
  operation: BulkFieldOperation<CharacterRosterStatus>,
  current: CharacterRosterStatus,
): CharacterRosterStatus {
  switch (operation.kind) {
    case 'unchanged':
      return current
    case 'set':
      return operation.value
    case 'reset':
      return createDefaultCharacterLifecycle().roster.status
  }
}

export function applyBulkRosterStatusOperations(
  current: CharacterLifecycle,
  bulk: CharacterBulkRosterFormValues,
): CharacterLifecyclePatch {
  const nextStatus = resolveBulkRosterStatus(bulk.rosterStatus, current.roster.status)

  if (nextStatus === current.roster.status) {
    return {}
  }

  return { roster: { status: nextStatus } }
}

export function isBulkRosterStatusNoOp(
  current: CharacterLifecycle,
  bulk: CharacterBulkRosterFormValues,
): boolean {
  const patch = applyBulkRosterStatusOperations(current, bulk)
  const merged = mergeCharacterLifecyclePatch(current, patch)
  return merged.roster.status === current.roster.status
}

export function countBulkRosterStatusChanges(
  selected: ReadonlyArray<{ lifecycle: CharacterLifecycle }>,
  bulk: CharacterBulkRosterFormValues,
): { wouldChangeCount: number; unchangedCount: number } {
  let wouldChangeCount = 0
  let unchangedCount = 0

  for (const row of selected) {
    if (isBulkRosterStatusNoOp(row.lifecycle, bulk)) {
      unchangedCount += 1
    } else {
      wouldChangeCount += 1
    }
  }

  return { wouldChangeCount, unchangedCount }
}
