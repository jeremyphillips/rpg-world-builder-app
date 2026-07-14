import { formatRollValue } from '../../../primitives/mechanics/roll'
import { getAbilityLabel } from '../../../vocab/ability'
import { HIT_POINTS_TERM } from '../../../vocab/spell/atomic-effect-kind'
import { formatDamageValue } from '../effects'
import type {
  SpellResolution,
  SpellResolutionDamageEffect,
  SpellResolutionHealingEffect,
  SpellResolutionOutcome,
  SpellResolutionTarget,
  SpellResolutionTargetProximity,
  SpellResolutionTemporaryHitPointsEffect,
} from './schema'
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

function formatDistanceFeet(distance: { value: number; unit: 'ft' }): string {
  return `${distance.value} feet`
}

/** Proximity phrase only — e.g. "you touch" / "within your reach" / "within 60 feet". */
export function formatResolutionTargetProximityPhrase(
  proximity: SpellResolutionTargetProximity,
): string {
  switch (proximity.kind) {
    case 'self':
      return 'yourself'
    case 'touch':
      return 'you touch'
    case 'reach':
      return proximity.distance
        ? `within your reach (${formatDistanceFeet(proximity.distance)})`
        : 'within your reach'
    case 'distance':
      return `within ${formatDistanceFeet(proximity.distance)}`
    default: {
      const _exhaustive: never = proximity
      return _exhaustive
    }
  }
}

/** e.g. "One creature within 60 feet" */
export function formatResolutionTarget(resolution: SpellResolution): string {
  return formatResolutionTargetFromParts(resolution.target)
}

/** Formats count, kind, and proximity without method context. */
export function formatResolutionTargetFromParts(target: SpellResolutionTarget): string {
  const { count, kind, proximity } = target
  return `${formatTargetCount(count)} ${formatTargetKindPhrase(kind)} ${formatResolutionTargetProximityPhrase(proximity)}`
}

/** e.g. "Ranged spell attack" / "Constitution saving throw" */
export function formatResolutionMethod(resolution: SpellResolution): string {
  const { method } = resolution
  switch (method.kind) {
    case 'attack':
      return getSpellResolutionAttackTypeLabel(method.attackType)
    case 'saving-throw':
      return `${getAbilityLabel(method.ability)} saving throw`
    case 'automatic':
      return 'Automatic'
    default: {
      const _exhaustive: never = method
      return _exhaustive
    }
  }
}

/** @deprecated Proximity is owned by target — use formatResolutionTargetProximityPhrase. */
export function formatResolutionRange(resolution: SpellResolution): string {
  return formatResolutionTargetProximityPhrase(resolution.target.proximity)
}

export function findResolutionDamageEffects(
  resolution: SpellResolution,
): SpellResolutionDamageEffect[] {
  return resolution.effects.filter(
    (effect): effect is SpellResolutionDamageEffect => effect.kind === 'damage',
  )
}

export function findResolutionHealingEffects(
  resolution: SpellResolution,
): SpellResolutionHealingEffect[] {
  return resolution.effects.filter(
    (effect): effect is SpellResolutionHealingEffect => effect.kind === 'healing',
  )
}

export function findResolutionTemporaryHitPointsEffects(
  resolution: SpellResolution,
): SpellResolutionTemporaryHitPointsEffect[] {
  return resolution.effects.filter(
    (effect): effect is SpellResolutionTemporaryHitPointsEffect =>
      effect.kind === 'temporary-hit-points',
  )
}

/** e.g. "2d8 healing" */
export function formatResolutionHealing(resolution: SpellResolution): string {
  const healing = findResolutionHealingEffects(resolution)[0]
  if (!healing) return ''
  return `${formatRollValue(healing.roll)} healing`
}

/** e.g. "2d4+4 temporary hit points" */
export function formatResolutionTemporaryHitPoints(resolution: SpellResolution): string {
  const temporaryHitPoints = findResolutionTemporaryHitPointsEffects(resolution)[0]
  if (!temporaryHitPoints) return ''
  return `${formatRollValue(temporaryHitPoints.roll)} temporary ${HIT_POINTS_TERM.plural}`
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

  if (effect?.kind === 'healing') {
    return amountLabel
      .replace(/^Full effect$/i, 'Full healing')
      .replace(/^Half effect$/i, 'Half healing')
  }

  if (effect?.kind === 'temporary-hit-points') {
    return amountLabel
      .replace(/^Full effect$/i, 'Full temporary hit points')
      .replace(/^Half effect$/i, 'Half temporary hit points')
  }

  if (effect?.kind === 'damage') {
    return amountLabel
      .replace(/^Full effect$/i, 'Full damage')
      .replace(/^Half effect$/i, 'Half damage')
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
      heading: 'Check',
      lines: [formatResolutionMethod(resolution)],
    },
  ]

  const damageLine = formatResolutionDamage(resolution)
  if (damageLine) {
    sections.push({ heading: 'Damage', lines: [damageLine] })
  }

  const healingLine = formatResolutionHealing(resolution)
  if (healingLine) {
    sections.push({ heading: 'Healing', lines: [healingLine] })
  }

  const temporaryHitPointsLine = formatResolutionTemporaryHitPoints(resolution)
  if (temporaryHitPointsLine) {
    sections.push({ heading: 'Temporary hit points', lines: [temporaryHitPointsLine] })
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
