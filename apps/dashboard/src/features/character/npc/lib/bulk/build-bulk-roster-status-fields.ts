import {
  CHARACTER_ROSTER_STATUS_ENTRIES,
  CHARACTER_ROSTER_STATUSES,
  type BulkFieldOperation,
  type CharacterRosterStatus,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

export const BULK_ROSTER_STATUS_FIELD_LABEL = 'Roster status' as const
export const BULK_ROSTER_STATUS_LEAVE_UNCHANGED = 'unchanged' as const

export type BulkRosterStatusFormFieldValues = {
  rosterStatusOption: string
}

export const BULK_ROSTER_STATUS_FORM_FIELD_DEFAULTS: BulkRosterStatusFormFieldValues = {
  rosterStatusOption: BULK_ROSTER_STATUS_LEAVE_UNCHANGED,
}

export function buildBulkRosterStatusOptions(includeLeaveUnchanged = true) {
  const options = CHARACTER_ROSTER_STATUSES.map((value) => ({
    value,
    label: CHARACTER_ROSTER_STATUS_ENTRIES[value].label,
  }))

  if (includeLeaveUnchanged) {
    return [{ value: BULK_ROSTER_STATUS_LEAVE_UNCHANGED, label: 'Leave unchanged' }, ...options]
  }

  return options
}

export function parseBulkRosterStatusOption(
  value: string,
): BulkFieldOperation<CharacterRosterStatus> {
  if (value === BULK_ROSTER_STATUS_LEAVE_UNCHANGED) return { kind: 'unchanged' }
  return { kind: 'set', value: value as CharacterRosterStatus }
}

/**
 * NPC lifecycle fields plug into the shared overview bulk-editor path.
 * Keep selection limits, patch construction, validation, and mutation
 * execution in the base bulk-editor infrastructure.
 */
export function buildBulkRosterStatusFields(): FormItem[] {
  return [
    {
      type: 'select',
      name: 'rosterStatusOption',
      label: BULK_ROSTER_STATUS_FIELD_LABEL,
      width: 'full',
      size: 'sm',
      options: buildBulkRosterStatusOptions(true),
    },
  ]
}
