import type { Spell } from '@rpg/contracts'
import { getClassName, getSpellDeliveryMethodLabel, getSpellSchoolLabel } from '@rpg/contracts'

import {
  formatCastingTime,
  formatSpellComponents,
  formatSpellDuration,
  formatSpellLevelLabel,
  formatSpellRange,
  spellRequiresConcentration,
} from './format-spell-metadata'

export type SpellStatRow = {
  label: string
  value: string
}

/** Builds label/value pairs for the spell detail stat section. */
export function buildSpellStatRows(spell: Spell): SpellStatRow[] {
  const rows: SpellStatRow[] = [
    { label: 'Level', value: formatSpellLevelLabel(spell.level) },
    { label: 'School', value: getSpellSchoolLabel(spell.school) },
    { label: 'Casting Time', value: formatCastingTime(spell.castingTime) },
    { label: 'Range', value: formatSpellRange(spell.range) },
    { label: 'Duration', value: formatSpellDuration(spell.duration) },
    { label: 'Components', value: formatSpellComponents(spell.components) },
    {
      label: 'Ritual',
      value: spell.castingTime.canBeCastAsRitual ? 'Yes' : 'No',
    },
    {
      label: 'Concentration',
      value: spellRequiresConcentration(spell.duration) ? 'Yes' : 'No',
    },
  ]

  if (spell.deliveryMethod) {
    rows.push({
      label: 'Delivery',
      value: getSpellDeliveryMethodLabel(spell.deliveryMethod),
    })
  }

  rows.push({
    label: 'Classes',
    value: spell.classIds.map(getClassName).join(', '),
  })

  return rows
}
