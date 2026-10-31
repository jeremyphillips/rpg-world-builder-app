import { formatResolutionApplicationSentence } from './format-effect-lines'
import type { ResolutionOutcome } from '../../lib/resolution/schema'
import type { SpellResolution } from './schema'
import { getResolutionOutcomeResultLabel } from '../../../vocab/resolution'

function formatOutcomeApplicationSummary(
  application: ResolutionOutcome['applications'][number],
  resolution: SpellResolution,
): string {
  return formatResolutionApplicationSentence(resolution, application.effectId, application.amount)
}

/** e.g. "Failed save: Target takes 2d10 necrotic damage." */
export function formatResolutionOutcomeLine(
  outcome: ResolutionOutcome,
  resolution: SpellResolution,
): string {
  const resultLabel = getResolutionOutcomeResultLabel(outcome.result)

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
