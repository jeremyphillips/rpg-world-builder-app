import { formatResolutionApplicationSentence } from './format-effect-lines'
import {
  formatOrderedOutcomeEffects,
  formatRepeatSaveTransition,
} from './format-ordered-outcome-effects'
import type { ResolutionOutcomeEffect } from './resolution-outcome-effect'
import type { ResolutionFormatInput, ResolutionOutcome } from './schema'
import { getResolutionOutcomeResultLabel } from '../../../vocab/resolution'

function formatOutcomeEffectClause(
  effect: ResolutionOutcomeEffect,
  resolution: ResolutionFormatInput,
): string | undefined {
  if (effect.kind === 'effect-reference') {
    const sentence = formatResolutionApplicationSentence(
      resolution,
      effect.effectId,
      effect.amount === 'half' ? 'half' : 'full',
    )
    return sentence ? `${sentence}.` : undefined
  }
  return formatOrderedOutcomeEffects([effect])[0]
}

/** e.g. "Failed save: Target takes 2d10 necrotic damage." */
export function formatResolutionOutcomeLine(
  outcome: ResolutionOutcome,
  resolution: ResolutionFormatInput,
): string {
  const resultLabel = getResolutionOutcomeResultLabel(outcome.result)
  const clauses = (outcome.effects ?? []).flatMap((effect) => {
    const clause = formatOutcomeEffectClause(effect, resolution)
    return clause ? [clause] : []
  })
  const body = clauses.join(' ')
  return body ? `${resultLabel}: ${body}` : resultLabel
}

/** Bullet-ready outcome lines in document order. */
export function formatResolutionOutcomes(resolution: ResolutionFormatInput): string[] {
  return resolution.outcomes.map((outcome) => formatResolutionOutcomeLine(outcome, resolution))
}

export { formatRepeatSaveTransition }
