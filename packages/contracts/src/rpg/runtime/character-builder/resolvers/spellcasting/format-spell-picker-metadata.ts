import type { Spell } from '../../../../content/spell'
import { formatSpellLevel } from '../../../../content/spell-levels'
import type { SpellTags } from '../../../../vocab/spell/tags'
import { getCastingTimeUnitLabel } from '../../../../vocab/spell/casting-time'
import type {
  SpellCastingTime,
  SpellComponents,
  SpellDuration,
  SpellRange,
} from '../../../../vocab/spell'
import { getDurationUnitLabel } from '../../../../vocab/spell/duration'
import { getSpellRangeKindLabel } from '../../../../vocab/spell/range'
import { getSpellSchoolLabel } from '../../../../vocab/spell/school'

export const SPELL_PICKER_CANTrip_LEVEL_LABEL = 'Cantrip'

const SUMMARY_SEPARATOR = ' · '

/** Returns "Cantrip" for level 0, otherwise `Level N` (e.g. "Level 1"). */
export function formatSpellPickerLevelLabel(level: number): string {
  if (level === 0) return SPELL_PICKER_CANTrip_LEVEL_LABEL
  return `Level ${level}`
}

const CASTING_TIME_UNIT_FORMATTERS: Record<string, (value: number) => string> = {
  action: (value) => (value === 1 ? 'Action' : `${value} Actions`),
  'bonus-action': (value) => (value === 1 ? 'Bonus action' : `${value} Bonus actions`),
  reaction: (value) => (value === 1 ? 'Reaction' : `${value} Reactions`),
  minute: (value) => (value === 1 ? '1 Minute' : `${value} Minutes`),
  hour: (value) => (value === 1 ? '1 Hour' : `${value} Hours`),
}

/** Compact casting time for picker rows (e.g. "Action", "1 Minute"). */
export function formatSpellPickerCastingTime(castingTime: SpellCastingTime): string {
  const { value, unit } = castingTime.normal
  const formatter = CASTING_TIME_UNIT_FORMATTERS[unit]
  if (formatter) return formatter(value)
  return `${value} ${getCastingTimeUnitLabel(unit)}`
}

/** Formats spell range for picker rows (e.g. "Self", "120 ft."). */
export function formatSpellPickerRange(range: SpellRange): string {
  switch (range.kind) {
    case 'distance': {
      const unit = formatSpellPickerRangeUnit(range.value.unit)
      return `${range.value.value} ${unit}`
    }
    case 'special':
      return range.description
    default:
      return getSpellRangeKindLabel(range.kind)
  }
}

/** Formats spell duration for picker rows (e.g. "Instantaneous"). */
export function formatSpellPickerDuration(duration: SpellDuration): string {
  switch (duration.kind) {
    case 'instantaneous':
      return 'Instantaneous'
    case 'special':
      return duration.description
    case 'timed': {
      const unitLabel = getDurationUnitLabel(duration.unit).toLowerCase()
      const durationText =
        duration.value === 1 ? `1 ${unitLabel}` : `${duration.value} ${unitLabel}s`
      if (duration.concentration && duration.upTo) {
        return `Concentration, up to ${durationText}`
      }
      if (duration.concentration) {
        return `Concentration, ${durationText}`
      }
      if (duration.upTo) {
        return `Up to ${durationText}`
      }
      return durationText
    }
  }
}

/** Formats spell components for picker detail (e.g. "V, S, M (fleece)"). */
export function formatSpellPickerComponents(components: SpellComponents): string {
  const parts: string[] = []
  if (components.verbal) parts.push('V')
  if (components.somatic) parts.push('S')
  if (components.material) {
    parts.push(`M (${components.material.description})`)
  }
  return parts.join(', ')
}

/** Returns "Concentration" when the spell requires concentration; otherwise undefined. */
export function formatSpellConcentrationMarker(duration: SpellDuration): string | undefined {
  return duration.kind === 'timed' && duration.concentration ? 'Concentration' : undefined
}

/** Returns "Ritual" when the spell can be cast as a ritual; otherwise undefined. */
export function formatSpellRitualMarker(castingTime: SpellCastingTime): string | undefined {
  return castingTime.canBeCastAsRitual ? 'Ritual' : undefined
}

function flattenSpellTags(tags: SpellTags | undefined): string[] {
  if (!tags) return []

  return [
    ...(tags.damageTypes ?? []),
    ...(tags.conditions ?? []),
    ...(tags.roles ?? []),
    ...(tags.functions ?? []),
  ]
}

function formatSpellPickerRangeUnit(unit: string): string {
  return unit.endsWith('.') ? unit : `${unit}.`
}

/** Builds the compact metadata line for spell picker rows. */
export function formatSpellPickerSummaryLine(spell: Spell): string {
  const parts = [
    formatSpellPickerLevelLabel(spell.level),
    getSpellSchoolLabel(spell.school),
    formatSpellPickerCastingTime(spell.castingTime),
    formatSpellPickerRange(spell.range),
    formatSpellPickerDuration(spell.duration),
  ]

  const concentrationMarker = formatSpellConcentrationMarker(spell.duration)
  if (concentrationMarker) parts.push(concentrationMarker)

  const ritualMarker = formatSpellRitualMarker(spell.castingTime)
  if (ritualMarker) parts.push(ritualMarker)

  if (spell.tags) {
    parts.push(...flattenSpellTags(spell.tags))
  }

  return parts.filter(Boolean).join(SUMMARY_SEPARATOR)
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Search text for spell picker ranking — name, school, level, tags, and plain description. */
export function buildSpellPickerSearchText(spell: Spell): string {
  const levelLabel =
    spell.level === 0 ? SPELL_PICKER_CANTrip_LEVEL_LABEL : formatSpellLevel(spell.level)
  const tagText = flattenSpellTags(spell.tags).join(' ')

  return [
    spell.name,
    getSpellSchoolLabel(spell.school),
    levelLabel,
    formatSpellPickerLevelLabel(spell.level),
    tagText || undefined,
    stripHtmlTags(spell.description ?? ''),
  ]
    .filter(Boolean)
    .join(' ')
}
