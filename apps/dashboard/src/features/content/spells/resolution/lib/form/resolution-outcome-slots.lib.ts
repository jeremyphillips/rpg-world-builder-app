import {
  buildDefaultOutcomeSlots,
  ensureOutcomeSlotsForMethod,
  getOutcomeResultsForMethod,
  normalizeOutcomeOrder,
  stripEmptyOutcomeSlots,
  type SpellResolution,
  type SpellResolutionMethod,
  type SpellResolutionOutcomeResult,
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
): readonly SpellResolutionOutcomeResult[] {
  const method = resolutionMethodFromForm(values)
  if (!method) return []
  return getOutcomeResultsForMethod(method)
}

function createEmptyOutcomeSlot(result: SpellResolutionOutcomeResult): ResolutionOutcomeFormItem {
  return { result, applications: [] }
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
    ...(outcome.note ? { note: outcome.note } : {}),
    applications: outcome.applications.map((application) => ({
      effectId: application.effectId,
      amount: application.amount,
    })),
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
    ...(outcome.note?.trim() ? { note: outcome.note.trim() } : {}),
    applications: outcome.applications.map((application) => ({
      effectId: parseEffectId(application.effectId),
      amount: application.amount,
    })),
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
    applications: outcome.applications.map((application) => ({
      effectId: application.effectId,
      amount: application.amount,
    })),
    ...(outcome.note ? { note: outcome.note } : {}),
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
): `${typeof RESOLUTION_OUTCOMES_FIELD}.${number}.applications.${number}.${typeof suffix}` {
  return `${RESOLUTION_OUTCOMES_FIELD}.${outcomeIndex}.applications.${applicationIndex}.${suffix}`
}
