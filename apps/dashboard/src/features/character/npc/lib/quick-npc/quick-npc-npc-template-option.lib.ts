import { NPC_TEMPLATE_ENTRIES } from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

export const QUICK_NPC_NPC_TEMPLATE_FIELD_PROMPT = 'What role should this NPC fill?' as const

/** Canonical NPC role options — labels and descriptions from NPC_TEMPLATE_ENTRIES. */
export function buildNpcTemplateRadioOptions(): RadioCardOption[] {
  return Object.entries(NPC_TEMPLATE_ENTRIES).map(([value, entry]) => ({
    value,
    label: entry.label,
    description: entry.description,
  }))
}
