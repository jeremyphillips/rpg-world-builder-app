import { formatRollValue } from '../../../../primitives/mechanics/roll'
import { formatDamageValue } from '../../effects/display'
import type { SpellResolution } from '../schema'
import {
  formatProgressionBaseValueLabel,
  formatProgressionTrackHeading,
  projectileUnitLabels,
  readProgressionBaseValue,
} from './references'
import { resolveLinearValueAtSlot, resolveProgressionValueAtCharacterLevel } from './resolve'
import type {
  SpellResolutionProgression,
  SpellResolutionProgressionTrack,
  SpellResolutionProgressionValue,
} from './schema'

function formatCountValueLabel(
  resolution: SpellResolution,
  reference: SpellResolutionProgressionTrack['reference'],
  count: number,
): string {
  if (reference.property === 'projectile-count') {
    const { singular, plural } = projectileUnitLabels(resolution)
    return `${count} ${count === 1 ? singular : plural}`
  }

  return String(count)
}

function formatResolvedProgressionValue(
  resolution: SpellResolution,
  reference: SpellResolutionProgressionTrack['reference'],
  value: SpellResolutionProgressionValue,
): string {
  if (value.kind === 'count') {
    return formatCountValueLabel(resolution, reference, value.count)
  }

  if (reference.subject.kind === 'effect' && reference.property === 'roll') {
    const effect = resolution.effects.find(
      (entry) => reference.subject.kind === 'effect' && entry.id === reference.subject.effectId,
    )
    if (effect?.kind === 'damage') {
      return formatDamageValue(value.roll, effect.damageType)
    }
    if (effect?.kind === 'healing') {
      return `${formatRollValue(value.roll)} healing`
    }
    if (effect?.kind === 'temporary-hit-points') {
      return `${formatRollValue(value.roll)} temporary hit points`
    }
  }

  return formatRollValue(value.roll)
}

function formatThresholdTrackLines(
  resolution: SpellResolution,
  track: Extract<SpellResolutionProgressionTrack, { kind: 'thresholds' }>,
  characterLevel?: number,
): string[] {
  const base = readProgressionBaseValue(resolution, track.reference)
  if (!base) return []

  const lines = [`Base value: ${formatProgressionBaseValueLabel(resolution, track.reference)}`]

  for (const entry of track.entries) {
    lines.push(
      `Level ${entry.threshold}: ${formatResolvedProgressionValue(resolution, track.reference, entry.value)}`,
    )
  }

  if (characterLevel !== undefined) {
    const current = resolveProgressionValueAtCharacterLevel(base, track.entries, characterLevel)
    lines.push(
      `At level ${characterLevel}: ${formatResolvedProgressionValue(resolution, track.reference, current)}`,
    )
  }

  return lines
}

function formatLinearTrackLines(
  resolution: SpellResolution,
  track: Extract<SpellResolutionProgressionTrack, { kind: 'linear' }>,
  spellLevel: number,
  castSlotLevel?: number,
): string[] {
  const base = readProgressionBaseValue(resolution, track.reference)
  if (!base) return []

  const lines = [
    `Base at ${spellLevel}${ordinalSuffix(spellLevel)} level: ${formatProgressionBaseValueLabel(resolution, track.reference)}`,
    `Each slot above ${spellLevel}${ordinalSuffix(spellLevel)}: +${formatResolvedProgressionValue(resolution, track.reference, track.increment)}`,
  ]

  if (castSlotLevel !== undefined && castSlotLevel > spellLevel) {
    const current = resolveLinearValueAtSlot(base, track.increment, spellLevel, castSlotLevel)
    lines.push(
      `At slot level ${castSlotLevel}: ${formatResolvedProgressionValue(resolution, track.reference, current)}`,
    )
  }

  return lines
}

function ordinalSuffix(level: number): string {
  const mod100 = level % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (level % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export type FormatProgressionTrackOptions = {
  spellLevel: number
  characterLevel?: number
  castSlotLevel?: number
}

/** Summary lines for one progression track. */
export function formatProgressionTrackSummary(
  resolution: SpellResolution,
  track: SpellResolutionProgressionTrack,
  options: FormatProgressionTrackOptions,
): string[] {
  const heading = formatProgressionTrackHeading(resolution, track.reference)
  const modeLabel =
    track.kind === 'thresholds' ? 'Character-level thresholds' : 'Higher-level slot scaling'

  const valueLines =
    track.kind === 'thresholds'
      ? formatThresholdTrackLines(resolution, track, options.characterLevel)
      : formatLinearTrackLines(resolution, track, options.spellLevel, options.castSlotLevel)

  return [heading, modeLabel, ...valueLines]
}

/**
 * Formats projectile + per-instance damage without aggregating rolls.
 * e.g. "4 darts, each dealing 1d4 + 1 Force damage"
 */
export function formatPerProjectileDamageLine(
  resolution: SpellResolution,
  projectileCount: number,
): string {
  const damage = resolution.effects.find((effect) => effect.kind === 'damage')
  if (!damage || damage.kind !== 'damage') return ''

  const { singular, plural } = projectileUnitLabels(resolution)
  const unit = projectileCount === 1 ? singular : plural

  return `${projectileCount} ${unit}, each dealing ${formatDamageValue(damage.roll, damage.damageType)}`
}

/** All progression summary lines for preview/detail panels. */
export function formatResolutionProgressionSummary(
  resolution: SpellResolution,
  progression: SpellResolutionProgression,
  options: FormatProgressionTrackOptions,
): string[] {
  return progression.tracks.flatMap((track) =>
    formatProgressionTrackSummary(resolution, track, options),
  )
}
