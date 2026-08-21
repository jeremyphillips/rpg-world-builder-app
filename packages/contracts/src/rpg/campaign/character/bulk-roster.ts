import type { BulkFieldOperation } from '../../../lib/bulk-field-operation'
import type { CharacterRosterStatus } from '../../vocab/character-roster-status'
import type { CharacterRosterState } from './roster-state'
import { createDefaultCampaignRosterState } from './participation'
import { type CampaignRosterPatch, mergeCampaignRosterPatch } from './update-roster'

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
      return createDefaultCampaignRosterState().status
  }
}

export function applyBulkRosterStatusOperations(
  current: CharacterRosterState,
  bulk: CharacterBulkRosterFormValues,
): CampaignRosterPatch {
  const nextStatus = resolveBulkRosterStatus(bulk.rosterStatus, current.status)

  if (nextStatus === current.status) {
    return {}
  }

  return { status: nextStatus }
}

export function isBulkRosterStatusNoOp(
  current: CharacterRosterState,
  bulk: CharacterBulkRosterFormValues,
): boolean {
  const patch = applyBulkRosterStatusOperations(current, bulk)
  const merged = mergeCampaignRosterPatch(current, patch)
  return merged.status === current.status
}

export function countBulkRosterStatusChanges(
  selected: ReadonlyArray<{ roster: CharacterRosterState }>,
  bulk: CharacterBulkRosterFormValues,
): { wouldChangeCount: number; unchangedCount: number } {
  let wouldChangeCount = 0
  let unchangedCount = 0

  for (const row of selected) {
    if (isBulkRosterStatusNoOp(row.roster, bulk)) {
      unchangedCount += 1
    } else {
      wouldChangeCount += 1
    }
  }

  return { wouldChangeCount, unchangedCount }
}
