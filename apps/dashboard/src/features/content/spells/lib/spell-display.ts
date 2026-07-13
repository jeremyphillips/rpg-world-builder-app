import {
  getEffectConditionLabel,
  getSpellDeliveryMethodLabel,
  getSpellFunctionTagLabel,
  getSpellRoleTagLabel,
  type Spell,
  type SpellTags,
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

export const SPELL_STAT_LABELS = {
  level: 'Level',
  school: 'School',
  castingTime: 'Casting Time',
  range: 'Range',
  duration: 'Duration',
  components: 'Components',
  ritual: 'Ritual',
  concentration: 'Concentration',
  delivery: 'Delivery',
} as const

export const SPELL_SECTION_LABELS = {
  classes: 'Classes',
  tags: 'Tags',
  cantripScaling: 'Cantrip Upgrade',
  higherLevelSlotEffect: 'Using a Higher-Level Spell Slot',
} as const

const SPELL_STAT_RITUAL_INFO =
  'When a spell can be cast as a ritual, you may extend its casting time by 10 minutes to cast it without expending a spell slot, if you have the spell prepared or it appears in your spellbook (for classes that use one).'

const SPELL_STAT_CONCENTRATION_INFO =
  'Some spells require Concentration to maintain. Your Concentration on a spell ends if you cast another Concentration spell, fail a Constitution saving throw after taking damage, or become Incapacitated or die.'

export type SpellDisplayVocabulary = {
  resolveSpellSchoolLabel: (schoolId: string) => string
  resolveSpellSchoolDescription: (schoolId: string) => string | undefined
  resolveDamageTypeLabel: (typeId: string) => string
  resolveClassLabel: (classSlug: string) => string
}

export type SpellDetailViewModel = {
  statRows: ContentStatRowData[]
  descriptionHtml?: string
  proseSections?: Array<{
    id: 'cantripScaling' | 'higherLevelSlotEffect'
    title: string
    bodyHtml: string
  }>
  classesSection?: {
    title: string
    items: Array<{ slug: string; label: string }>
  }
  tagsSection?: {
    title: string
    labels: string[]
  }
}

function collectTagLabels(tags: SpellTags, vocabulary: SpellDisplayVocabulary): string[] {
  const labels: string[] = []
  tags.roles?.forEach((role) => labels.push(getSpellRoleTagLabel(role)))
  tags.functions?.forEach((fn) => labels.push(getSpellFunctionTagLabel(fn)))
  tags.damageTypes?.forEach((type) => labels.push(vocabulary.resolveDamageTypeLabel(type)))
  tags.conditions?.forEach((condition) => labels.push(getEffectConditionLabel(condition)))
  return labels
}

function buildSpellStatRows(
  spell: Spell,
  vocabulary: SpellDisplayVocabulary,
): ContentStatRowData[] {
  const schoolLabel = vocabulary.resolveSpellSchoolLabel(spell.school)
  const schoolDescription = vocabulary.resolveSpellSchoolDescription(spell.school)

  const rows: ContentStatRowData[] = [
    { label: SPELL_STAT_LABELS.level, value: formatSpellLevelLabel(spell.level) },
    {
      label: SPELL_STAT_LABELS.school,
      value: schoolLabel,
      info: schoolDescription,
      infoAriaLabel: `About ${schoolLabel}`,
    },
    { label: SPELL_STAT_LABELS.castingTime, value: formatCastingTime(spell.castingTime) },
    { label: SPELL_STAT_LABELS.range, value: formatSpellRange(spell.range) },
    { label: SPELL_STAT_LABELS.duration, value: formatSpellDuration(spell.duration) },
    { label: SPELL_STAT_LABELS.components, value: formatSpellComponents(spell.components) },
    {
      label: SPELL_STAT_LABELS.ritual,
      value: spell.castingTime.canBeCastAsRitual ? 'Yes' : 'No',
      info: SPELL_STAT_RITUAL_INFO,
      infoPlacement: 'label',
    },
    {
      label: SPELL_STAT_LABELS.concentration,
      value: spellRequiresConcentration(spell.duration) ? 'Yes' : 'No',
      info: SPELL_STAT_CONCENTRATION_INFO,
      infoPlacement: 'label',
    },
  ]

  if (spell.deliveryMethod) {
    rows.push({
      label: SPELL_STAT_LABELS.delivery,
      value: getSpellDeliveryMethodLabel(spell.deliveryMethod),
    })
  }

  return rows
}

function buildProseSections(spell: Spell): SpellDetailViewModel['proseSections'] {
  const sections: NonNullable<SpellDetailViewModel['proseSections']> = []

  if (spell.cantripScaling?.trim()) {
    sections.push({
      id: 'cantripScaling',
      title: SPELL_SECTION_LABELS.cantripScaling,
      bodyHtml: spell.cantripScaling,
    })
  }

  if (spell.higherLevelSlotEffect?.trim()) {
    sections.push({
      id: 'higherLevelSlotEffect',
      title: SPELL_SECTION_LABELS.higherLevelSlotEffect,
      bodyHtml: spell.higherLevelSlotEffect,
    })
  }

  return sections.length > 0 ? sections : undefined
}

export function buildSpellDetailViewModel(
  spell: Spell,
  vocabulary: SpellDisplayVocabulary,
): SpellDetailViewModel {
  const tagLabels = spell.tags ? collectTagLabels(spell.tags, vocabulary) : []

  return {
    statRows: buildSpellStatRows(spell, vocabulary),
    descriptionHtml: spell.description || undefined,
    proseSections: buildProseSections(spell),
    classesSection:
      spell.classIds.length > 0
        ? {
            title: SPELL_SECTION_LABELS.classes,
            items: spell.classIds.map((slug) => ({
              slug,
              label: vocabulary.resolveClassLabel(slug),
            })),
          }
        : undefined,
    tagsSection:
      tagLabels.length > 0
        ? {
            title: SPELL_SECTION_LABELS.tags,
            labels: tagLabels,
          }
        : undefined,
  }
}
