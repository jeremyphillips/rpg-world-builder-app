import {
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

const CANTrip_UPGRADE_SPLIT = /<p><strong>Cantrip Upgrade\./i
const HIGHER_LEVEL_DESCRIPTION_SPLIT =
  /<p><strong>(?:Using a Higher-Level Spell Slot|At Higher Levels)\./i

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

export const SPELL_DETAIL_SECTION_LABELS = {
  cantripScaling: 'Cantrip upgrade',
  higherLevelSlotEffect: 'At higher levels',
  tags: 'Tags',
  classes: 'Classes',
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
}

export type SpellDescriptionSections = {
  mainHtml: string
  cantripScalingHtml?: string
  higherLevelHtml?: string
}

/** Splits spell description HTML into main prose and optional scaling sections. */
export function splitSpellDescriptionSections(description: string): SpellDescriptionSections {
  const cantripMatch = description.match(CANTrip_UPGRADE_SPLIT)
  const higherLevelMatch = description.match(HIGHER_LEVEL_DESCRIPTION_SPLIT)

  const markers = [
    cantripMatch?.index !== undefined
      ? { type: 'cantrip' as const, index: cantripMatch.index }
      : null,
    higherLevelMatch?.index !== undefined
      ? { type: 'higher' as const, index: higherLevelMatch.index }
      : null,
  ]
    .filter((marker): marker is { type: 'cantrip' | 'higher'; index: number } => marker !== null)
    .sort((left, right) => left.index - right.index)

  if (markers.length === 0) {
    return { mainHtml: description }
  }

  const first = markers[0]!
  const mainHtml = description.slice(0, first.index).trim()
  const tail = description.slice(first.index).trim()

  if (first.type === 'cantrip') {
    const higherInTail = tail.match(HIGHER_LEVEL_DESCRIPTION_SPLIT)
    if (higherInTail?.index !== undefined) {
      return {
        mainHtml,
        cantripScalingHtml: tail.slice(0, higherInTail.index).trim(),
        higherLevelHtml: tail.slice(higherInTail.index).trim(),
      }
    }

    return {
      mainHtml,
      cantripScalingHtml: tail,
    }
  }

  return {
    mainHtml,
    higherLevelHtml: tail,
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

function buildProseSections(
  spell: Spell,
  splitSections: SpellDescriptionSections,
): SpellDetailProseSections {
  return {
    cantripScaling: spell.cantripScaling?.trim() || splitSections.cantripScalingHtml,
    higherLevelSlotEffect:
      spell.higherLevelSlotEffect?.trim() || splitSections.higherLevelHtml,
  }
}

function buildDescriptionHtml(
  spell: Spell,
  splitSections: SpellDescriptionSections,
): string | undefined {
  const rawDescription = spell.description ?? ''
  if (!rawDescription) return undefined

  const hasDedicatedFields =
    Boolean(spell.cantripScaling?.trim()) || Boolean(spell.higherLevelSlotEffect?.trim())
  const hasEmbeddedSections =
    Boolean(splitSections.cantripScalingHtml) || Boolean(splitSections.higherLevelHtml)

  if (hasDedicatedFields || hasEmbeddedSections) {
    return splitSections.mainHtml || undefined
  }

  return rawDescription
}

export function buildSpellDetailViewModel(
  spell: Spell,
  vocabulary: SpellDisplayVocabulary = {},
): SpellDetailViewModel {
  const resolveSchoolLabel = vocabulary.resolveSpellSchoolLabel ?? getSpellSchoolLabel
  const rawDescription = spell.description ?? ''
  const splitSections = rawDescription
    ? splitSpellDescriptionSections(rawDescription)
    : { mainHtml: '' }

  const tagLabels = spell.tags ? collectTagLabels(spell.tags, vocabulary) : []
  const classLabels = resolveClassLabels(spell, vocabulary)
  const proseSections = buildProseSections(spell, splitSections)

  return {
    statRows: buildSpellStatRows(spell, {
      resolveSpellSchoolLabel: resolveSchoolLabel,
      resolveSpellSchoolDescription: vocabulary.resolveSpellSchoolDescription,
    }),
    descriptionHtml: buildDescriptionHtml(spell, splitSections),
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
  }
}

/** @deprecated Use {@link splitSpellDescriptionSections} via spell-display. */
export function splitSpellDescriptionHtml(description: string): {
  mainHtml: string
  higherLevelHtml: string | undefined
} {
  const sections = splitSpellDescriptionSections(description)
  return {
    mainHtml: sections.mainHtml,
    higherLevelHtml: sections.higherLevelHtml,
  }
}
