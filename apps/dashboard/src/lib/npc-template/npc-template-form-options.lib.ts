import { NPC_TEMPLATE_ENTRIES } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'
import type { RadioCardOption } from '@rpg/ui'

/** Select / combobox options in catalog order. */
export function buildNpcTemplateFieldOptions(): FieldOption[] {
  return Object.entries(NPC_TEMPLATE_ENTRIES).map(([value, entry]) => ({
    value,
    label: entry.label,
  }))
}

/** Radio card options with descriptions for create setup and build card editors. */
export function buildNpcTemplateRadioCardOptions(): RadioCardOption[] {
  return Object.entries(NPC_TEMPLATE_ENTRIES).map(([value, entry]) => ({
    value,
    label: entry.label,
    description: entry.description,
  }))
}
