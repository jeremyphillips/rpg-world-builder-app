import { SETTLEMENT_TYPE_ENTRIES, type SettlementType } from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

export const SETTLEMENT_CREATE_SETUP_PROMPT = 'What kind of settlement are you creating?' as const

export const SETTLEMENT_CREATE_SETUP_FIELD_LABEL = 'Settlement type' as const

export const SETTLEMENT_CREATE_SETUP_HEADLINE = 'Create settlement' as const

/** Canonical settlement type options — labels and order from SETTLEMENT_TYPE_ENTRIES. */
export function buildSettlementTypeRadioOptions(): RadioCardOption[] {
  return Object.entries(SETTLEMENT_TYPE_ENTRIES).map(([value, entry]) => ({
    value,
    label: entry.label,
    description: entry.description,
  }))
}

export function isSettlementType(value: string): value is SettlementType {
  return value in SETTLEMENT_TYPE_ENTRIES
}
