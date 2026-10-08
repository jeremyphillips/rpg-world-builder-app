import type { Spell } from '../../../../content/spell'
import { formatSpellLevel } from '../../../../content/spell/levels'
import type { DurationUnit, SpellDuration, SpellRange } from '../../../../vocab/spell'
import { getSpellSchoolLabel } from '../../../../vocab/spell/school'
import {
  formatSpellConcentrationMarker,
  formatSpellPickerCastingTime,
  formatSpellPickerRange,
  formatSpellRitualMarker,
  SPELL_PICKER_CANTrip_LEVEL_LABEL,
} from './format-spell-picker-metadata'

/** Compact picker rows keep a fixed semantic budget. Detail views stay exhaustive. */
export const MAX_SPELL_PICKER_METADATA_GROUPS = 4

/**
 * Inclusion priority for optional groups. Higher values win a remaining slot.
 * Required groups (`classification`, `castingTime`) ignore this map.
 */
export const SPELL_PICKER_METADATA_INCLUSION_PRIORITY = {
  concentration: 100,
  ritual: 80,
  range: 60,
  duration: 50,
  selfRange: 20,
} as const

/** Presentation order after the budget has chosen which groups to keep. */
export const SPELL_PICKER_METADATA_DISPLAY_ORDER = [
  'classification',
  'ritual',
  'castingTime',
  'range',
  'concentration',
  'duration',
] as const

export type SpellPickerMetadataKind = (typeof SPELL_PICKER_METADATA_DISPLAY_ORDER)[number]

export type SpellPickerMetadataGroup =
  | {
      kind: 'classification'
      levelLabel: string
      schoolLabel: string
    }
  | {
      kind: 'ritual'
      label: string
    }
  | {
      kind: 'castingTime'
      label: string
    }
  | {
      kind: 'range'
      label: string
    }
  | {
      kind: 'concentration'
      label: string
    }
  | {
      kind: 'duration'
      label: string
    }

export type SpellPickerCompactSummary = {
  /** Curated comparison groups for one compact picker metadata line. */
  groups: readonly SpellPickerMetadataGroup[]
}

const SPELL_PICKER_COMPACT_DURATION_UNITS: Record<
  DurationUnit,
  { singular: string; plural: string }
> = {
  minute: { singular: 'min', plural: 'min' },
  hour: { singular: 'hour', plural: 'hours' },
  round: { singular: 'round', plural: 'rounds' },
  day: { singular: 'day', plural: 'days' },
}

type SpellPickerMetadataCandidate = {
  kind: SpellPickerMetadataKind
  required: boolean
  priority: number
  group: SpellPickerMetadataGroup
}

function formatSpellPickerClassificationLevelLabel(level: number): string {
  if (level === 0) return SPELL_PICKER_CANTrip_LEVEL_LABEL
  return `${formatSpellLevel(level)}-level`
}

/** Compact timed amount for picker rows (e.g. "10 min", "1 hour"). Omits "up to". */
export function formatSpellPickerCompactDurationAmount(value: number, unit: DurationUnit): string {
  const labels = SPELL_PICKER_COMPACT_DURATION_UNITS[unit]
  const unitLabel = value === 1 ? labels.singular : labels.plural
  return `${value} ${unitLabel}`
}

function spellPickerMetadataDisplayIndex(kind: SpellPickerMetadataKind): number {
  return SPELL_PICKER_METADATA_DISPLAY_ORDER.indexOf(kind)
}

function spellPickerRangeInclusionPriority(range: SpellRange): number {
  return range.kind === 'self'
    ? SPELL_PICKER_METADATA_INCLUSION_PRIORITY.selfRange
    : SPELL_PICKER_METADATA_INCLUSION_PRIORITY.range
}

function compareSpellPickerMetadataInclusion(
  left: SpellPickerMetadataCandidate,
  right: SpellPickerMetadataCandidate,
): number {
  if (left.priority !== right.priority) return right.priority - left.priority
  return spellPickerMetadataDisplayIndex(left.kind) - spellPickerMetadataDisplayIndex(right.kind)
}

function selectSpellPickerMetadataGroups(
  candidates: readonly SpellPickerMetadataCandidate[],
): SpellPickerMetadataGroup[] {
  const required = candidates.filter((candidate) => candidate.required)
  const optionalSlots = Math.max(0, MAX_SPELL_PICKER_METADATA_GROUPS - required.length)
  const selectedOptional = candidates
    .filter((candidate) => !candidate.required)
    .sort(compareSpellPickerMetadataInclusion)
    .slice(0, optionalSlots)
  const selectedKinds = new Set(
    [...required, ...selectedOptional].map((candidate) => candidate.kind),
  )

  return SPELL_PICKER_METADATA_DISPLAY_ORDER.flatMap((kind) => {
    if (!selectedKinds.has(kind)) return []
    const candidate = candidates.find((entry) => entry.kind === kind)
    return candidate ? [candidate.group] : []
  })
}

function buildSpellPickerDurationCandidates(
  duration: SpellDuration,
): SpellPickerMetadataCandidate[] {
  if (duration.kind === 'instantaneous') return []

  if (duration.kind === 'special') {
    return [
      {
        kind: 'duration',
        required: false,
        priority: SPELL_PICKER_METADATA_INCLUSION_PRIORITY.duration,
        group: { kind: 'duration', label: duration.description },
      },
    ]
  }

  const amount = formatSpellPickerCompactDurationAmount(duration.value, duration.unit)
  const concentration = formatSpellConcentrationMarker(duration)
  if (concentration) {
    return [
      {
        kind: 'concentration',
        required: false,
        priority: SPELL_PICKER_METADATA_INCLUSION_PRIORITY.concentration,
        group: { kind: 'concentration', label: `${concentration} ${amount}` },
      },
    ]
  }

  return [
    {
      kind: 'duration',
      required: false,
      priority: SPELL_PICKER_METADATA_INCLUSION_PRIORITY.duration,
      group: { kind: 'duration', label: amount },
    },
  ]
}

function buildSpellPickerMetadataCandidates(spell: Spell): SpellPickerMetadataCandidate[] {
  const candidates: SpellPickerMetadataCandidate[] = [
    {
      kind: 'classification',
      required: true,
      priority: 0,
      group: {
        kind: 'classification',
        levelLabel: formatSpellPickerClassificationLevelLabel(spell.level),
        schoolLabel: getSpellSchoolLabel(spell.school),
      },
    },
    {
      kind: 'castingTime',
      required: true,
      priority: 0,
      group: {
        kind: 'castingTime',
        label: formatSpellPickerCastingTime(spell.castingTime),
      },
    },
  ]

  const ritual = formatSpellRitualMarker(spell.castingTime)
  if (ritual) {
    candidates.push({
      kind: 'ritual',
      required: false,
      priority: SPELL_PICKER_METADATA_INCLUSION_PRIORITY.ritual,
      group: { kind: 'ritual', label: ritual },
    })
  }

  candidates.push({
    kind: 'range',
    required: false,
    priority: spellPickerRangeInclusionPriority(spell.range),
    group: {
      kind: 'range',
      label: formatSpellPickerRange(spell.range),
    },
  })

  candidates.push(...buildSpellPickerDurationCandidates(spell.duration))
  return candidates
}

/**
 * Curated compact facts for spell picker rows.
 * Picker metadata is intentionally curated for decision value. It has a fixed
 * semantic budget and must not become an exhaustive dump of entity attributes.
 */
export function resolveSpellPickerMetadata(spell: Spell): readonly SpellPickerMetadataGroup[] {
  return selectSpellPickerMetadataGroups(buildSpellPickerMetadataCandidates(spell))
}

/** Plain label for one resolved group, including classification as "1st-level Evocation". */
export function formatSpellPickerMetadataGroupLabel(group: SpellPickerMetadataGroup): string {
  if (group.kind === 'classification') return `${group.levelLabel} ${group.schoolLabel}`
  return group.label
}

/** Builds the curated compact summary stored on spell picker rows. */
export function buildSpellPickerCompactSummary(spell: Spell): SpellPickerCompactSummary {
  return { groups: resolveSpellPickerMetadata(spell) }
}
