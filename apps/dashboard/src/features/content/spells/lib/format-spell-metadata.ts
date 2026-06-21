import type { SpellCastingTime, SpellComponents, SpellDuration, SpellRange } from '@rpg/contracts'
import {
  formatSpellLevel,
  getCastingTimeUnitLabel,
  getDurationUnitLabel,
  getSpellRangeKindLabel,
} from '@rpg/contracts'

export const CANTRIP_LEVEL_LABEL = 'Cantrip'

/** Returns "Cantrip" for level 0, otherwise an ordinal level label. */
export function formatSpellLevelLabel(level: number): string {
  if (level === 0) return CANTRIP_LEVEL_LABEL
  return formatSpellLevel(level)
}

export type FormatCastingTimeOptions = {
  /** When false, omits reaction trigger text (e.g. for compact table columns). Defaults to true. */
  includeTrigger?: boolean
}

/** Formats a spell casting time for display (e.g. "1 Action", "1 Reaction (when hit)"). */
export function formatCastingTime(
  castingTime: SpellCastingTime,
  options: FormatCastingTimeOptions = {},
): string {
  const { includeTrigger = true } = options
  const { value, unit, trigger } = castingTime.normal

  let timeStr: string
  switch (unit) {
    case 'action':
      timeStr = value === 1 ? '1 Action' : `${value} Actions`
      break
    case 'bonus-action':
      timeStr = value === 1 ? '1 Bonus action' : `${value} Bonus actions`
      break
    case 'reaction':
      timeStr = value === 1 ? '1 Reaction' : `${value} Reactions`
      break
    case 'minute':
      timeStr = value === 1 ? '1 Minute' : `${value} Minutes`
      break
    case 'hour':
      timeStr = value === 1 ? '1 Hour' : `${value} Hours`
      break
    default:
      timeStr = `${value} ${getCastingTimeUnitLabel(unit)}`
  }

  if (includeTrigger && trigger) {
    timeStr = `${timeStr} (${trigger})`
  }

  return timeStr
}

/** Formats a spell range for display (e.g. "Self", "120 ft."). */
export function formatSpellRange(range: SpellRange): string {
  switch (range.kind) {
    case 'distance':
      return `${range.value.value} ${range.value.unit}.`
    case 'special':
      return range.description
    default:
      return getSpellRangeKindLabel(range.kind)
  }
}

/** Formats a spell duration for display (e.g. "Instantaneous", "Concentration, up to 10 minutes"). */
export function formatSpellDuration(duration: SpellDuration): string {
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
export function formatSpellComponents(components: SpellComponents): string {
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
