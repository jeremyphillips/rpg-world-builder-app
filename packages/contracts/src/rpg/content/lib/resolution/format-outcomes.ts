import { formatResolutionApplicationSentence } from './format-effect-lines'
import {
  formatOrderedOutcomeEffects,
  formatRepeatSaveTransition,
} from './format-ordered-outcome-effects'
import type { ResolutionFormatInput, ResolutionOutcome } from './schema'
import { getResolutionOutcomeResultLabel } from '../../../vocab/resolution'

function formatOutcomeApplicationSummary(
  application: ResolutionOutcome['applications'][number],
  resolution: ResolutionFormatInput,
): string {
  return formatResolutionApplicationSentence(resolution, application.effectId, application.amount)
}

/** e.g. "Failed save: Target takes 2d10 necrotic damage." */
export function formatResolutionOutcomeLine(
  outcome: ResolutionOutcome,
  resolution: ResolutionFormatInput,
): string {
  const resultLabel = getResolutionOutcomeResultLabel(outcome.result)
  const orderedClauses = formatOrderedOutcomeEffects(outcome.effects)
  const noteClause = outcome.note?.trim()
    ? [outcome.note.trim().endsWith('.') ? outcome.note.trim() : `${outcome.note.trim()}.`]
    : []

  if (outcome.applications.length === 0) {
    const body = [...orderedClauses, ...noteClause].join(' ')
    return body ? `${resultLabel}: ${body}` : resultLabel
  }

  const applicationSummary = outcome.applications
    .map((application) => formatOutcomeApplicationSummary(application, resolution))
    .join(', ')

  const body = [...[`${applicationSummary}.`], ...orderedClauses, ...noteClause].join(' ')
  return `${resultLabel}: ${body}`
}

/** Bullet-ready outcome lines in document order. */
export function formatResolutionOutcomes(resolution: ResolutionFormatInput): string[] {
  return resolution.outcomes.map((outcome) => formatResolutionOutcomeLine(outcome, resolution))
}

export { formatRepeatSaveTransition }
