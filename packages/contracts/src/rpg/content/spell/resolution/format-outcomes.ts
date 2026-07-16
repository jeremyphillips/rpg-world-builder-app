import type { SpellResolution, SpellResolutionOutcome } from './schema'
import {
  getSpellResolutionApplicationAmountLabel,
  getSpellResolutionOutcomeResultLabel,
} from './vocab'

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
