import type { Spell } from '../../../../content/spell'
import { formatSpellLevel } from '../../../../content/spell/levels'
import type { SpellTags } from '../../../../vocab/spell/tags'
import type { SpellCastingTime, SpellDuration } from '../../../../vocab/spell'
import { getSpellSchoolLabel } from '../../../../vocab/spell/school'
import {
  formatSpellCastingTimeLabel,
  formatSpellComponentsLabel,
  formatSpellDurationLabel,
  formatSpellRangeLabel,
} from '../../../../content/spell/format-spell-metadata-core'
import { stripHtmlTags } from '../../../../../lib/strip-html-tags'

export const SPELL_PICKER_CANTrip_LEVEL_LABEL = 'Cantrip'

/** Returns "Cantrip" for level 0, otherwise an ordinal level label (e.g. "1st level"). */
export function formatSpellPickerLevelLabel(level: number): string {
  if (level === 0) return SPELL_PICKER_CANTrip_LEVEL_LABEL
  return `${formatSpellLevel(level)} level`
}

/** Compact casting time for picker rows (e.g. "Action", "1 minute"). Omits reaction triggers. */
export function formatSpellPickerCastingTime(castingTime: SpellCastingTime): string {
  return formatSpellCastingTimeLabel(castingTime, 'picker', { includeTrigger: false })
}

/** Formats spell range for picker rows (e.g. "Self", "120 ft"). */
export function formatSpellPickerRange(range: Parameters<typeof formatSpellRangeLabel>[0]): string {
  return formatSpellRangeLabel(range, 'picker')
}

/** Full duration phrase shared with detail views (e.g. "Instantaneous", "Concentration, up to 10 minutes"). */
export const formatSpellPickerDuration = formatSpellDurationLabel

/** Formats spell components for picker detail (e.g. "V, S, M (fleece)"). */
export const formatSpellPickerComponents = formatSpellComponentsLabel

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
