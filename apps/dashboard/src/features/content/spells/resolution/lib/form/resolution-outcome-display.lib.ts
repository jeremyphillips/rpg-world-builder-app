import {
  effectKindPrefix,
  formatDamageValue,
  formatRollValue,
  getSpellAtomicEffectKindLabel,
  HIT_POINTS_TERM,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  type RollFormShape,
} from '../../../../lib/forms/mechanics/roll-form-values'
import type { ResolutionEffectFormItem } from './resolution-form-schema'

/** Compact effect summary for outcome application labels, e.g. "2d8 Acid damage". */
export function formatResolutionOutcomeEffectSummary(effect: ResolutionEffectFormItem): string {
  const roll = normalizeRollFormValue(effect.roll as RollFormShape)
  if (!roll) return ''

  switch (effect.kind) {
    case 'damage':
      return effect.damageType ? formatDamageValue(roll, effect.damageType) : formatRollValue(roll)
    case 'healing':
      return `${formatRollValue(roll)} ${HIT_POINTS_TERM.plural}`
    case 'temporary-hit-points':
      return `${formatRollValue(roll)} temporary ${HIT_POINTS_TERM.plural}`
    default: {
      const _exhaustive: never = effect
      return _exhaustive
    }
  }
}

/** Menu and row label, e.g. "Damage — 2d8 Acid damage". */
export function formatResolutionOutcomeEffectMenuLabel(effect: ResolutionEffectFormItem): string {
  const kindLabel = getSpellAtomicEffectKindLabel(effect.kind)
  const summary = formatResolutionOutcomeEffectSummary(effect)
  return effectKindPrefix(kindLabel, summary)
}

export function findResolutionEffectById(
  effects: readonly ResolutionEffectFormItem[],
  effectId: string,
): ResolutionEffectFormItem | undefined {
  return effects.find((effect) => effect.id === effectId)
}
