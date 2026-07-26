import {
  CHARACTER_BULK_ROSTER_FORM_DEFAULT,
  countBulkRosterStatusChanges,
  type CampaignNpcListItem,
  type CharacterBulkRosterFormValues,
} from '@rpg/contracts'

import {
  parseBulkRosterStatusOption,
  type BulkRosterStatusFormFieldValues,
} from './build-bulk-roster-status-fields'

export function toBulkRosterStatusFormValues(
  fieldValues: BulkRosterStatusFormFieldValues,
): CharacterBulkRosterFormValues {
  return {
    rosterStatus: parseBulkRosterStatusOption(fieldValues.rosterStatusOption),
  }
}

export type BulkRosterStatusPreview = {
  selectedCount: number
  wouldChangeCount: number
  unchangedCount: number
  hasChanges: boolean
}

export function resolveBulkRosterStatusPreview(
  selected: ReadonlyArray<CampaignNpcListItem>,
  fieldValues: BulkRosterStatusFormFieldValues,
): BulkRosterStatusPreview {
  const bulk = toBulkRosterStatusFormValues(fieldValues)
  const { wouldChangeCount, unchangedCount } = countBulkRosterStatusChanges(
    selected.map((row) => ({ roster: row.participation.roster })),
    bulk,
  )

  return {
    selectedCount: selected.length,
    wouldChangeCount,
    unchangedCount,
    hasChanges: bulk.rosterStatus.kind !== 'unchanged',
  }
}

export const BULK_ROSTER_STATUS_EMPTY_FORM_VALUES = CHARACTER_BULK_ROSTER_FORM_DEFAULT
