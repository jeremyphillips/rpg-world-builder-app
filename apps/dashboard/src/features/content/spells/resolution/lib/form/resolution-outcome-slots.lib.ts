import {
  buildDefaultOutcomeSlots,
  ensureOutcomeSlotsForMethod,
  getOutcomeResultsForMethod,
  normalizeOutcomeOrder,
  stripEmptyOutcomeSlots,
  type SpellResolution,
  type SpellResolutionMethod,
  type ResolutionOutcomeResult,
} from '@rpg/contracts'

import { buildResolutionMethod } from './resolution-method-values'
import type { ResolutionFormValues, ResolutionOutcomeFormItem } from './resolution-form-schema'
import { findPrimaryEffectId, parseEffectId } from './resolution-effect-values'

export function resolutionMethodFromForm(
  values: Pick<ResolutionFormValues, 'methodKind' | 'attackType' | 'saveAbility'>,
): SpellResolutionMethod | undefined {
  return buildResolutionMethod(values as ResolutionFormValues)
}

export function getOutcomeResultsForFormMethod(
  values: Pick<ResolutionFormValues, 'methodKind' | 'attackType' | 'saveAbility'>,
): readonly ResolutionOutcomeResult[] {
  const method = resolutionMethodFromForm(values)
  if (!method) return []
  return getOutcomeResultsForMethod(method)
}

function toStoredOutcomeEffects(
  effects: ResolutionOutcomeFormItem['effects'] | undefined,
): SpellResolution['outcomes'][number]['effects'] {
  const stored: SpellResolution['outcomes'][number]['effects'] = []
  for (const effect of effects ?? []) {
    if (effect.kind === 'effect-reference') {
      stored.push({
        kind: 'effect-reference',
        effectId: parseEffectId(effect.effectId),
        amount: effect.amount,
      })
      continue
    }
    if (effect.kind === 'note') {
      const description = effect.description.trim()
      if (description) stored.push({ kind: 'note', description })
      continue
    }
    stored.push(effect)
  }
  return stored
}

function createEmptyOutcomeSlot(result: ResolutionOutcomeResult): ResolutionOutcomeFormItem {
  return { result, effects: [] }
}

export function hydrateOutcomeFormSlots(
  method: SpellResolutionMethod,
  outcomes: readonly ResolutionOutcomeFormItem[],
): ResolutionOutcomeFormItem[] {
  return ensureOutcomeSlotsForMethod(method, outcomes, createEmptyOutcomeSlot)
}

export function storedOutcomesToFormSlots(
  method: SpellResolutionMethod,
  outcomes: SpellResolution['outcomes'],
): ResolutionOutcomeFormItem[] {
  const mapped = outcomes.map((outcome) => ({
    result: outcome.result,
    effects: (outcome.effects ?? []).map((effect) =>
      effect.kind === 'effect-reference'
        ? { kind: 'effect-reference' as const, effectId: effect.effectId, amount: effect.amount }
        : effect,
    ),
    ...(outcome.repeatSave ? { repeatSave: outcome.repeatSave } : {}),
  }))

  return hydrateOutcomeFormSlots(method, mapped)
}

export function formOutcomesToStoredShape(
  method: SpellResolutionMethod,
  outcomes: readonly ResolutionOutcomeFormItem[] | undefined,
): SpellResolution['outcomes'] | undefined {
  if (!outcomes) return undefined

  const normalized = normalizeOutcomeOrder(method, outcomes)
  const meaningful = stripEmptyOutcomeSlots(normalized)

  if (!meaningful.length) return undefined

  return meaningful.map((outcome) => ({
    result: outcome.result,
    effects: toStoredOutcomeEffects(outcome.effects),
    ...(outcome.repeatSave ? { repeatSave: outcome.repeatSave } : {}),
  }))
}

export function buildDefaultOutcomeFormSlots(
  values: ResolutionFormValues,
): ResolutionOutcomeFormItem[] | undefined {
  const method = resolutionMethodFromForm(values)
  const primaryEffectId = findPrimaryEffectId(values.effects)
  if (!method || !primaryEffectId) return undefined

  return buildDefaultOutcomeSlots(method, primaryEffectId).map((outcome) => ({
    result: outcome.result,
    effects: outcome.effects.map((effect) => ({
      kind: 'effect-reference' as const,
      effectId: effect.effectId,
      amount: effect.amount,
    })),
  }))
}

export const RESOLUTION_OUTCOMES_FIELD = 'outcomes' as const

export function resolutionOutcomeFieldPath(
  outcomeIndex: number,
  suffix?: string,
): `${typeof RESOLUTION_OUTCOMES_FIELD}.${number}${string}` {
  return suffix
    ? (`${RESOLUTION_OUTCOMES_FIELD}.${outcomeIndex}.${suffix}` as const)
    : (`${RESOLUTION_OUTCOMES_FIELD}.${outcomeIndex}` as const)
}

export function resolutionOutcomeApplicationFieldPath(
  outcomeIndex: number,
  applicationIndex: number,
  suffix: 'effectId' | 'amount',
): `${typeof RESOLUTION_OUTCOMES_FIELD}.${number}.effects.${number}.${typeof suffix}` {
  return `${RESOLUTION_OUTCOMES_FIELD}.${outcomeIndex}.effects.${applicationIndex}.${suffix}`
}
