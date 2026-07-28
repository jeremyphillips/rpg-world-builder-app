import { getCastingTimeUnitLabel } from '../../vocab/spell/casting-time'
import type {
  SpellCastingTime,
  SpellComponents,
  SpellDuration,
  SpellRange,
} from '../../vocab/spell'
import { getDurationUnitLabel } from '../../vocab/spell/duration'
import { getSpellRangeKindLabel } from '../../vocab/spell/range'

export type SpellMetadataDisplayStyle = 'detail' | 'picker'

type CastingTimeUnitFormatter = (value: number) => string

const DETAIL_CASTING_TIME_UNIT_FORMATTERS: Record<string, CastingTimeUnitFormatter> = {
  action: (value) => (value === 1 ? '1 Action' : `${value} Actions`),
  'bonus-action': (value) => (value === 1 ? '1 Bonus action' : `${value} Bonus actions`),
  reaction: (value) => (value === 1 ? '1 Reaction' : `${value} Reactions`),
  minute: (value) => (value === 1 ? '1 Minute' : `${value} Minutes`),
  hour: (value) => (value === 1 ? '1 Hour' : `${value} Hours`),
}

const PICKER_CASTING_TIME_UNIT_FORMATTERS: Record<string, CastingTimeUnitFormatter> = {
  action: (value) => (value === 1 ? 'Action' : `${value} actions`),
  'bonus-action': (value) => (value === 1 ? 'Bonus action' : `${value} bonus actions`),
  reaction: (value) => (value === 1 ? 'Reaction' : `${value} reactions`),
  minute: (value) => (value === 1 ? '1 minute' : `${value} minutes`),
  hour: (value) => (value === 1 ? '1 hour' : `${value} hours`),
}

function formatCastingTimeUnit(
  value: number,
  unit: string,
  style: SpellMetadataDisplayStyle,
): string {
  const formatters =
    style === 'detail' ? DETAIL_CASTING_TIME_UNIT_FORMATTERS : PICKER_CASTING_TIME_UNIT_FORMATTERS
  const formatter = formatters[unit]
  if (formatter) return formatter(value)

  const unitLabel = getCastingTimeUnitLabel(unit)
  return style === 'detail' ? `${value} ${unitLabel}` : `${value} ${unitLabel.toLowerCase()}`
}

export type FormatSpellCastingTimeOptions = {
  /** When false, omits reaction trigger text. Defaults to true for detail style. */
  includeTrigger?: boolean
}

/** Formats spell casting time for display. */
export function formatSpellCastingTimeLabel(
  castingTime: SpellCastingTime,
  style: SpellMetadataDisplayStyle,
  options: FormatSpellCastingTimeOptions = {},
): string {
  const { value, unit, trigger } = castingTime.normal
  const includeTrigger = options.includeTrigger ?? style === 'detail'

  let timeStr = formatCastingTimeUnit(value, unit, style)
  if (includeTrigger && trigger) {
    timeStr = `${timeStr} (${trigger})`
  }

  return timeStr
}

/** Formats spell range for display. */
export function formatSpellRangeLabel(range: SpellRange, style: SpellMetadataDisplayStyle): string {
  switch (range.kind) {
    case 'distance': {
      const distance = `${range.value.value} ${range.value.unit}`
      return style === 'detail' ? `${distance}.` : distance
    }
    case 'special':
      return range.description
    default:
      return getSpellRangeKindLabel(range.kind)
  }
}

/** Formats spell duration for display (e.g. "Instantaneous", "Concentration, up to 10 minutes"). */
export function formatSpellDurationLabel(duration: SpellDuration): string {
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

/** Formats spell components for display (e.g. "V, S, M (a bit of fleece)"). */
export function formatSpellComponentsLabel(components: SpellComponents): string {
  const parts: string[] = []
  if (components.verbal) parts.push('V')
  if (components.somatic) parts.push('S')
  if (components.material) {
    parts.push(`M (${components.material.description})`)
  }
  return parts.join(', ')
}

/** Whether a spell requires concentration based on its duration metadata. */
export function spellRequiresConcentration(duration: SpellDuration): boolean {
  return duration.kind === 'timed' && duration.concentration === true
}
