import { SETTLEMENT_TYPE_ENTRIES, type SettlementType } from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import type { LocationCreateIntent } from '../lib/location-create-session'

export const SETTLEMENT_CREATE_SETUP_PROMPT = 'What kind of settlement are you creating?' as const

export const SETTLEMENT_CREATE_SETUP_CHANGE_LABEL = 'Change settlement type' as const

export const SETTLEMENT_CREATE_SETUP_SUMMARY_EYEBROW = SETTLEMENT_CREATE_SETUP_PROMPT

/** Canonical settlement type options — labels and order from SETTLEMENT_TYPE_ENTRIES. */
export function buildSettlementTypeRadioOptions(): RadioCardOption[] {
  return Object.entries(SETTLEMENT_TYPE_ENTRIES).map(([value, entry]) => ({
    value,
    label: entry.label,
    description: entry.description,
  }))
}

export function resolveSettlementCreateSetupDescription(intent: LocationCreateIntent): string {
  if (intent.parentLocationId != null) {
    return 'Choose the settlement size before authoring.'
  }

  return 'Choose the settlement size before authoring. You can place it under a parent on the next screen.'
}

export function isSettlementType(value: string): value is SettlementType {
  return value in SETTLEMENT_TYPE_ENTRIES
}
