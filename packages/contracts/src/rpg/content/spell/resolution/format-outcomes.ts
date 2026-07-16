import { formatResolutionApplicationSentence } from './format-effect-lines'
import type { SpellResolution, SpellResolutionOutcome } from './schema'
import { getSpellResolutionOutcomeResultLabel } from './vocab'

function formatOutcomeApplicationSummary(
  application: SpellResolutionOutcome['applications'][number],
  resolution: SpellResolution,
): string {
  return formatResolutionApplicationSentence(resolution, application.effectId, application.amount)
}

/** e.g. "Failed save: Target takes 2d10 necrotic damage." */
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

  const line = `${resultLabel}: ${applicationSummary}.`
  return outcome.note ? `${line} ${outcome.note}` : line
}

/** Bullet-ready outcome lines in document order. */
export function formatResolutionOutcomes(resolution: SpellResolution): string[] {
  return resolution.outcomes.map((outcome) => formatResolutionOutcomeLine(outcome, resolution))
}
