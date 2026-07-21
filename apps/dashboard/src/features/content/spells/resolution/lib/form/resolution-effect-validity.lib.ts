import {
  supportsPartialApplicationForEffectKind,
  DAMAGE_TYPE_TERM,
  getTermSentenceForm,
  withArticle,
  type SpellResolutionApplicationAmount,
  type SpellResolutionOutcomeResult,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  type RollFormShape,
} from '../../../../lib/forms/mechanics/roll-form-values'
import type { ResolutionEffectFormItem } from './resolution-form-schema'

export type ResolutionEffectCompletenessField = 'roll' | 'damageType'

export type ResolutionEffectCompleteness =
  | { complete: true }
  | { complete: false; missing: ResolutionEffectCompletenessField[] }

export function getResolutionEffectCompleteness(
  effect: ResolutionEffectFormItem,
): ResolutionEffectCompleteness {
  const missing: ResolutionEffectCompletenessField[] = []
  const roll = normalizeRollFormValue(effect.roll as RollFormShape)

  if (!roll) {
    missing.push('roll')
  }

  if (effect.kind === 'damage' && !effect.damageType) {
    missing.push('damageType')
  }

  if (missing.length === 0) {
    return { complete: true }
  }

  return { complete: false, missing }
}

export function formatResolutionEffectCompletenessMessage(
  effect: ResolutionEffectFormItem,
  result: Extract<ResolutionEffectCompleteness, { complete: false }>,
): string {
  const { missing } = result

  if (effect.kind === 'damage') {
    if (missing.includes('roll') && missing.includes('damageType')) {
      return 'Complete the damage roll and type.'
    }
    if (missing.includes('roll')) {
      return 'Complete the damage roll.'
    }
    if (missing.includes('damageType')) {
      return `Select ${withArticle(getTermSentenceForm(DAMAGE_TYPE_TERM, 1))}.`
    }
  }

  if (effect.kind === 'healing') {
    return 'Complete the healing roll.'
  }

  return 'Complete the roll.'
}

export function defaultApplicationAmountForOutcome(
  effect: ResolutionEffectFormItem,
  outcomeResult: SpellResolutionOutcomeResult,
): SpellResolutionApplicationAmount {
  if (outcomeResult === 'successful-save' && supportsPartialApplicationForEffectKind(effect.kind)) {
    return 'half'
  }

  return 'full'
}
