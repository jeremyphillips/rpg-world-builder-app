import {
  formatAreaGeometry,
  formatAtomicEffectSummaries,
  formatSlugAsLabel,
  getEffectConditionLabel,
  getSpellDeliveryMethodLabel,
  getSpellFunctionTagLabel,
  getSpellRoleTagLabel,
  getSpellSchoolLabel,
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
  area: 'Area',
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

export const SPELL_DETAIL_SECTION_LABELS = {
  tags: 'Tags',
  classes: 'Classes',
  effects: 'Effects',
} as const

const SPELL_STAT_RITUAL_INFO =
  'When a spell can be cast as a ritual, you may extend its casting time by 10 minutes to cast it without expending a spell slot, if you have the spell prepared or it appears in your spellbook (for classes that use one).'

const SPELL_STAT_CONCENTRATION_INFO =
  'Some spells require Concentration to maintain. Your Concentration on a spell ends if you cast another Concentration spell, fail a Constitution saving throw after taking damage, or become Incapacitated or die.'

export type SpellDisplayVocabulary = {
  resolveSpellSchoolLabel?: (schoolId: string) => string
  resolveSpellSchoolDescription?: (schoolId: string) => string | undefined
  resolveDamageTypeLabel?: (typeId: string) => string
  resolveClassLabel?: (slug: string) => string
}

export type SpellDetailProseSections = {
  cantripScaling?: string
  higherLevelSlotEffect?: string
}

export type SpellDetailViewModel = {
  statRows: ContentStatRowData[]
  descriptionHtml?: string
  proseSections: SpellDetailProseSections
  tagLabels: string[]
  classLabels: string[]
  classesSection?: {
    title: string
    items: Array<{ slug: string; label: string }>
  }
  tagsSection?: {
    title: string
    labels: string[]
  }
  effectsSection?: {
    title: string
    lines: string[]
  }
}

function collectTagLabels(tags: SpellTags, vocabulary: SpellDisplayVocabulary): string[] {
  const labels: string[] = []
  tags.roles?.forEach((role) => labels.push(getSpellRoleTagLabel(role)))
  tags.functions?.forEach((fn) => labels.push(getSpellFunctionTagLabel(fn)))
  tags.damageTypes?.forEach((type) =>
    labels.push(vocabulary.resolveDamageTypeLabel?.(type) ?? formatSlugAsLabel(type)),
  )
  tags.conditions?.forEach((condition) => labels.push(getEffectConditionLabel(condition)))
  return labels
}

function buildSpellStatRows(
  spell: Spell,
  vocabulary: {
    resolveSpellSchoolLabel: (schoolId: string) => string
    resolveSpellSchoolDescription?: (schoolId: string) => string | undefined
  },
): ContentStatRowData[] {
  const schoolLabel = vocabulary.resolveSpellSchoolLabel(spell.school)
  const schoolDescription = vocabulary.resolveSpellSchoolDescription?.(spell.school)

  const rows: ContentStatRowData[] = [
    { label: SPELL_STAT_LABELS.level, value: formatSpellLevelLabel(spell.level) },
    {
      label: SPELL_STAT_LABELS.school,
      value: schoolLabel,
      info: schoolDescription,
      infoAriaLabel: schoolDescription ? `About ${schoolLabel}` : undefined,
    },
    { label: SPELL_STAT_LABELS.castingTime, value: formatCastingTime(spell.castingTime) },
    { label: SPELL_STAT_LABELS.range, value: formatSpellRange(spell.range) },
    ...(spell.areaOfEffect
      ? [{ label: SPELL_STAT_LABELS.area, value: formatAreaGeometry(spell.areaOfEffect) }]
      : []),
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

function resolveClassLabels(spell: Spell, vocabulary: SpellDisplayVocabulary): string[] {
  return spell.classIds.map(
    (slug) => vocabulary.resolveClassLabel?.(slug) ?? formatSlugAsLabel(slug),
  )
}

function buildProseSections(spell: Spell): SpellDetailProseSections {
  if (spell.resolution?.progression) {
    return {}
  }

  return {
    cantripScaling: spell.cantripScaling?.trim() || undefined,
    higherLevelSlotEffect: spell.higherLevelSlotEffect?.trim() || undefined,
  }
}

export function buildSpellDetailViewModel(
  spell: Spell,
  vocabulary: SpellDisplayVocabulary = {},
): SpellDetailViewModel {
  const resolveSchoolLabel = vocabulary.resolveSpellSchoolLabel ?? getSpellSchoolLabel
  const tagLabels = spell.tags ? collectTagLabels(spell.tags, vocabulary) : []
  const classLabels = resolveClassLabels(spell, vocabulary)
  const proseSections = buildProseSections(spell)

  return {
    statRows: buildSpellStatRows(spell, {
      resolveSpellSchoolLabel: resolveSchoolLabel,
      resolveSpellSchoolDescription: vocabulary.resolveSpellSchoolDescription,
    }),
    descriptionHtml: spell.description || undefined,
    proseSections,
    tagLabels,
    classLabels,
    classesSection:
      spell.classIds.length > 0
        ? {
            title: SPELL_SECTION_LABELS.classes,
            items: spell.classIds.map((slug) => ({
              slug,
              label: vocabulary.resolveClassLabel?.(slug) ?? formatSlugAsLabel(slug),
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
    effectsSection:
      spell.effects && spell.effects.length > 0
        ? {
            title: SPELL_DETAIL_SECTION_LABELS.effects,
            lines: formatAtomicEffectSummaries(spell.effects),
          }
        : undefined,
  }
}
