import type { SpellCastingTime } from '@rpg/contracts'
import {
  formatSpellCastingTimeLabel,
  formatSpellComponentsLabel,
  formatSpellDurationLabel,
  formatSpellLevel,
  formatSpellRangeLabel,
  spellRequiresConcentration,
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
  return formatSpellCastingTimeLabel(castingTime, 'detail', options)
}

/** Formats a spell range for display (e.g. "Self", "120 ft."). */
export function formatSpellRange(range: Parameters<typeof formatSpellRangeLabel>[0]): string {
  return formatSpellRangeLabel(range, 'detail')
}

/** Formats a spell duration for display (e.g. "Instantaneous", "Concentration, up to 10 minutes"). */
export const formatSpellDuration = formatSpellDurationLabel

/** Formats spell components for display (e.g. "V, S, M (a bit of fleece)"). */
export const formatSpellComponents = formatSpellComponentsLabel

export { spellRequiresConcentration }
