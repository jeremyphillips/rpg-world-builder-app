import type { CharacterClass, Spell } from '@rpg/contracts'
import { formatSlugAsLabel, getSpellDeliveryMethodLabel } from '@rpg/contracts'

import {
  getSpellSchoolDescriptionFromVocabulary,
  getSpellSchoolLabelFromVocabulary,
  type SpellSchoolVocabulary,
} from '@/features/homebrew'

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

export type BuildSpellStatRowsOptions = {
  /** Resolved catalog class names keyed by slug; falls back to {@link formatSlugAsLabel}. */
  classesBySlug?: ReadonlyMap<string, CharacterClass>
  /** Campaign-resolved spell school labels and descriptions. */
  spellSchoolVocabulary?: SpellSchoolVocabulary
}

function resolveClassLabel(
  slug: string,
  classesBySlug: ReadonlyMap<string, CharacterClass> | undefined,
): string {
  return classesBySlug?.get(slug)?.name ?? formatSlugAsLabel(slug)
}

/** Builds label/value pairs for the spell detail stat section. */
export function buildSpellStatRows(
  spell: Spell,
  options: BuildSpellStatRowsOptions = {},
): ContentStatRowData[] {
  const { classesBySlug, spellSchoolVocabulary } = options
  const schoolLabel = getSpellSchoolLabelFromVocabulary(spellSchoolVocabulary, spell.school)
  const schoolDescription = getSpellSchoolDescriptionFromVocabulary(
    spellSchoolVocabulary,
    spell.school,
  )

  const rows: ContentStatRowData[] = [
    { label: 'Level', value: formatSpellLevelLabel(spell.level) },
    {
      label: 'School',
      value: schoolLabel,
      info: schoolDescription,
      infoAriaLabel: `About ${schoolLabel}`,
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

  if (spell.classIds.length > 0) {
    rows.push({
      label: 'Classes',
      value: spell.classIds.map((slug) => resolveClassLabel(slug, classesBySlug)).join(', '),
    })
  }

  return rows
}
