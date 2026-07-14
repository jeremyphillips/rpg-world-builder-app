import { formatRollValue } from '../../../primitives/mechanics/roll'
import { getAbilityLabel } from '../../../vocab/ability'
import { formatDamageValue } from '../effects'
import type { SpellResolution, SpellResolutionDamageEffect, SpellResolutionOutcome } from './schema'
import {
  getSpellResolutionApplicationAmountLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionOutcomeResultLabel,
  getSpellResolutionTargetKindLabel,
} from './vocab'

// ---------------------------------------------------------------------------
// Spell resolution display formatters — semantic strings for preview/detail UI.
// ---------------------------------------------------------------------------

function formatTargetCount(count: number): string {
  if (count === 1) return 'One'
  return String(count)
}

function formatTargetKindPhrase(kind: SpellResolution['target']['kind']): string {
  switch (kind) {
    case 'creature':
      return 'creature'
    case 'object':
      return 'object'
    case 'creature-or-object':
      return 'creature or object'
    default: {
      return getSpellResolutionTargetKindLabel(kind)
    }
  }
}

/** e.g. "One creature or object" */
export function formatResolutionTarget(resolution: SpellResolution): string {
  const { count, kind } = resolution.target
  return `${formatTargetCount(count)} ${formatTargetKindPhrase(kind)}`
}

/** e.g. "Ranged spell attack" / "Constitution saving throw" */
export function formatResolutionMethod(resolution: SpellResolution): string {
  const { method } = resolution
  switch (method.kind) {
    case 'attack':
      return getSpellResolutionAttackTypeLabel(method.attackType)
    case 'saving-throw':
      return `${getAbilityLabel(method.ability)} saving throw`
    default: {
      const _exhaustive: never = method
      return _exhaustive
    }
  }
}

function formatDistanceFeet(distance: { value: number; unit: 'ft' }): string {
  return `${distance.value} feet`
}

/** e.g. "Range: Touch" / "Range: 120 feet" / "Range: Reach (10 feet)" */
export function formatResolutionRange(resolution: SpellResolution): string {
  const { range } = resolution
  switch (range.kind) {
    case 'touch':
      return 'Range: Touch'
    case 'reach':
      return range.distance
        ? `Range: Reach (${formatDistanceFeet(range.distance)})`
        : 'Range: Reach'
    case 'distance':
      return `Range: ${formatDistanceFeet(range.value)}`
    default: {
      const _exhaustive: never = range
      return _exhaustive
    }
  }
}

export function findResolutionDamageEffects(
  resolution: SpellResolution,
): SpellResolutionDamageEffect[] {
  return resolution.effects.filter(
    (effect): effect is SpellResolutionDamageEffect => effect.kind === 'damage',
  )
}

/** e.g. "2d10 Necrotic" — uses the first damage effect when several exist. */
export function formatResolutionDamage(resolution: SpellResolution): string {
  const damage = findResolutionDamageEffects(resolution)[0]
  if (!damage) return ''
  return formatDamageValue(damage.roll, damage.damageType)
}

function formatOutcomeApplicationSummary(
  application: SpellResolutionOutcome['applications'][number],
  resolution: SpellResolution,
): string {
  const effect = resolution.effects.find((entry) => entry.id === application.effectId)
  const amountLabel = getSpellResolutionApplicationAmountLabel(application.amount)

  if (effect?.kind === 'damage') {
    return amountLabel
  }

  return amountLabel
}

/** e.g. "Hit: Full damage" */
export function formatResolutionOutcomeLine(
  outcome: SpellResolutionOutcome,
  resolution: SpellResolution,
): string {
  const resultLabel = getSpellResolutionOutcomeResultLabel(outcome.result)

  if (outcome.applications.length === 0) {
    return outcome.note ? `${resultLabel}: ${outcome.note}` : resultLabel
  }

  const applicationSummary = outcome.applications
    .map((application) => formatOutcomeApplicationSummary(application, resolution))
    .join(', ')

  const line = `${resultLabel}: ${applicationSummary}`
  return outcome.note ? `${line}. ${outcome.note}` : line
}

/** Bullet-ready outcome lines in document order. */
export function formatResolutionOutcomes(resolution: SpellResolution): string[] {
  return resolution.outcomes.map((outcome) => formatResolutionOutcomeLine(outcome, resolution))
}

export type SpellResolutionSummarySection = {
  heading: string
  lines: string[]
}

/** Structured summary sections for preview panels. */
export function formatResolutionSummarySections(
  resolution: SpellResolution,
): SpellResolutionSummarySection[] {
  const sections: SpellResolutionSummarySection[] = [
    { heading: 'Target', lines: [formatResolutionTarget(resolution)] },
    {
      heading: 'Resolution',
      lines: [formatResolutionMethod(resolution), formatResolutionRange(resolution)],
    },
  ]

  const damageLine = formatResolutionDamage(resolution)
  if (damageLine) {
    sections.push({ heading: 'Damage', lines: [damageLine] })
  }

  const outcomeLines = formatResolutionOutcomes(resolution)
  if (outcomeLines.length > 0) {
    sections.push({ heading: 'Outcomes', lines: outcomeLines })
  }

  return sections
}

/** Flattened preview text block. */
export function formatResolutionSummary(resolution: SpellResolution): string {
  return formatResolutionSummarySections(resolution)
    .flatMap((section) => [section.heading, ...section.lines])
    .join('\n')
}

/** Compact damage line using roll formatting only (no damage type label). */
export function formatResolutionDamageRoll(resolution: SpellResolution): string {
  const damage = findResolutionDamageEffects(resolution)[0]
  if (!damage) return ''
  return formatRollValue(damage.roll)
}
