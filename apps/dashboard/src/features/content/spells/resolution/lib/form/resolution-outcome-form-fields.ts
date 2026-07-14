import type { SpellResolutionOutcomeResult } from '@rpg/contracts'

import {
  findResolutionEffectById,
  formatResolutionOutcomeEffectMenuLabel,
} from './resolution-outcome-display.lib'
import type {
  ResolutionEffectFormItem,
  ResolutionOutcomeApplicationFormItem,
  ResolutionOutcomeFormItem,
} from './resolution-form-schema'

export type ResolutionOutcomeEffectMenuItem = {
  id: string
  label: string
  effectId: string
}

export function appliedEffectIdsForOutcome(
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
): Set<string> {
  return new Set(outcome.applications.map((application) => application.effectId))
}

/** Effects available to add via the application menu for one outcome branch. */
export function eligibleEffectsForOutcomeApplication(
  effects: readonly ResolutionEffectFormItem[],
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
): ResolutionEffectFormItem[] {
  const applied = appliedEffectIdsForOutcome(outcome)
  return effects.filter((effect) => !applied.has(effect.id))
}

export function buildOutcomeEffectApplicationMenuItems(
  effects: readonly ResolutionEffectFormItem[],
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
): ResolutionOutcomeEffectMenuItem[] {
  return eligibleEffectsForOutcomeApplication(effects, outcome).map((effect) => ({
    id: effect.id,
    effectId: effect.id,
    label: formatResolutionOutcomeEffectMenuLabel(effect),
  }))
}

export function formatOutcomeApplicationRowLabel(
  effects: readonly ResolutionEffectFormItem[],
  application: ResolutionOutcomeApplicationFormItem,
): string {
  const effect = findResolutionEffectById(effects, application.effectId)
  if (!effect) return application.effectId
  return formatResolutionOutcomeEffectMenuLabel(effect)
}

export function createOutcomeApplicationAppendValue(
  effectId: string,
): ResolutionOutcomeApplicationFormItem {
  return { effectId, amount: 'full' }
}

export function findOutcomeIndexByResult(
  outcomes: readonly ResolutionOutcomeFormItem[],
  result: SpellResolutionOutcomeResult,
): number {
  return outcomes.findIndex((outcome) => outcome.result === result)
}
