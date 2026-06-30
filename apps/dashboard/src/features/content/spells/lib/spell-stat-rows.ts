import type { Spell } from '@rpg/contracts'
import {
  getClassName,
  getSpellDeliveryMethodLabel,
  getSpellSchoolEntry,
  getSpellSchoolLabel,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'
import {
  formatCastingTime,
  formatSpellComponents,
  formatSpellDuration,
  formatSpellLevelLabel,
  formatSpellRange,
  spellRequiresConcentration,
} from './format-spell-metadata'

const SPELL_STAT_RITUAL_INFO =
  'When a spell can be cast as a ritual, you may extend its casting time by 10 minutes to cast it without expending a spell slot, if you have the spell prepared or it appears in your spellbook (for classes that use one).'

const SPELL_STAT_CONCENTRATION_INFO =
  'Some spells require Concentration to maintain. Your Concentration on a spell ends if you cast another Concentration spell, fail a Constitution saving throw after taking damage, or become Incapacitated or die.'

/** Builds label/value pairs for the spell detail stat section. */
export function buildSpellStatRows(spell: Spell): ContentStatRowData[] {
  const rows: ContentStatRowData[] = [
    { label: 'Level', value: formatSpellLevelLabel(spell.level) },
    {
      label: 'School',
      value: getSpellSchoolLabel(spell.school),
      info: getSpellSchoolEntry(spell.school)?.description,
      infoAriaLabel: `About ${getSpellSchoolLabel(spell.school)}`,
    },
    { label: 'Casting Time', value: formatCastingTime(spell.castingTime) },
    { label: 'Range', value: formatSpellRange(spell.range) },
    { label: 'Duration', value: formatSpellDuration(spell.duration) },
    { label: 'Components', value: formatSpellComponents(spell.components) },
    {
      label: 'Ritual',
      value: spell.castingTime.canBeCastAsRitual ? 'Yes' : 'No',
      info: SPELL_STAT_RITUAL_INFO,
      infoPlacement: 'label',
    },
    {
      label: 'Concentration',
      value: spellRequiresConcentration(spell.duration) ? 'Yes' : 'No',
      info: SPELL_STAT_CONCENTRATION_INFO,
      infoPlacement: 'label',
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
