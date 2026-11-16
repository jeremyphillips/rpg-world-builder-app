import type { ResolutionEffectReference } from './resolution-outcome-effect'
import type { ResolutionEffectId } from './resolution-effect-id'
import type { RepeatSave } from './repeat-save'
import { hasMeaningfulRepeatSave } from './repeat-save'
import type { ResolutionEffectKind } from './selection-types'
import type { ResolutionMethodKind, ResolutionOutcomeResult } from '../../../vocab/resolution'

type ResolutionMethodRef = { kind: ResolutionMethodKind }

// ---------------------------------------------------------------------------
// Method-derived outcome slots — shared by stored validation and form adapters.
// ---------------------------------------------------------------------------

export type OutcomeLike = {
  result: ResolutionOutcomeResult
  effects?: readonly unknown[]
  repeatSave?: RepeatSave
}

/** Required outcome slots created for a resolution method, in stable display order. */
export function getOutcomeResultsForMethod(method: {
  kind: ResolutionMethodKind
}): readonly ResolutionOutcomeResult[] {
  switch (method.kind) {
    case 'automatic':
      return ['applied']
    case 'attack':
      return ['hit', 'miss']
    case 'saving-throw':
      return ['failed-save', 'successful-save']
    default: {
      const _exhaustive: never = method.kind
      return _exhaustive
    }
  }
}

/** Optional save outcomes appended after required slots when present in storage. */
export function getOptionalOutcomeResultsForMethod(method: {
  kind: ResolutionMethodKind
}): readonly ResolutionOutcomeResult[] {
  if (method.kind === 'saving-throw') return ['failed-or-successful-save']
  return []
}

/** Structural allowlist for validation and normalization. */
export function getAllowedOutcomeResultsForMethod(method: {
  kind: ResolutionMethodKind
}): readonly ResolutionOutcomeResult[] {
  return [...getOutcomeResultsForMethod(method), ...getOptionalOutcomeResultsForMethod(method)]
}

/** True when an outcome has at least one effect row or a repeat save. */
export function hasMeaningfulOutcomeContent(outcome: OutcomeLike): boolean {
  if (outcome.effects && outcome.effects.length > 0) return true
  if (hasMeaningfulRepeatSave(outcome.repeatSave)) return true
  return false
}

/** True when an outcome has no effect rows and no repeat save. */
export function isOutcomeEmpty(outcome: OutcomeLike): boolean {
  return !hasMeaningfulOutcomeContent(outcome)
}

export function findOutcomeByResult<T extends OutcomeLike>(
  outcomes: readonly T[],
  result: ResolutionOutcomeResult,
): T | undefined {
  return outcomes.find((outcome) => outcome.result === result)
}

/** Reorders outcomes to match method slot order; keeps optional save outcomes when present. */
export function normalizeOutcomeOrder<T extends OutcomeLike>(
  method: ResolutionMethodRef,
  outcomes: readonly T[],
): T[] {
  const allowed = new Set(getAllowedOutcomeResultsForMethod(method))
  const byResult = new Map(
    outcomes
      .filter((outcome) => allowed.has(outcome.result))
      .map((outcome) => [outcome.result, outcome]),
  )

  const order = [
    ...getOutcomeResultsForMethod(method),
    ...getOptionalOutcomeResultsForMethod(method),
  ]

  return order
    .map((result) => byResult.get(result))
    .filter((outcome): outcome is T => outcome !== undefined)
}

/** Merges stored outcomes with empty method-derived slots; preserves all authored data. */
export function ensureOutcomeSlotsForMethod<T extends OutcomeLike>(
  method: ResolutionMethodRef,
  outcomes: readonly T[],
  createEmptySlot: (result: ResolutionOutcomeResult) => T,
): T[] {
  const optional = getOptionalOutcomeResultsForMethod(method)
  const storableResults = new Set([...getOutcomeResultsForMethod(method), ...optional])
  const byResult = new Map(
    outcomes
      .filter((outcome) => storableResults.has(outcome.result))
      .map((outcome) => [outcome.result, outcome]),
  )

  const requiredSlots = getOutcomeResultsForMethod(method).map(
    (result) => byResult.get(result) ?? createEmptySlot(result),
  )
  const optionalSlots = optional
    .map((result) => byResult.get(result))
    .filter((outcome): outcome is T => outcome !== undefined)

  return [...requiredSlots, ...optionalSlots]
}

/** Effect kinds that support `amount: 'half'` in the resolution MVP. */
export function effectKindsSupportingPartialApplication(): readonly ResolutionEffectKind[] {
  return ['damage']
}

export function supportsPartialApplicationForEffectKind(kind: string): boolean {
  return effectKindsSupportingPartialApplication().includes(kind as ResolutionEffectKind)
}

function defaultEffectReferencesForResult(
  result: ResolutionOutcomeResult,
  primaryEffectId: ResolutionEffectId,
): ResolutionEffectReference[] {
  switch (result) {
    case 'applied':
    case 'hit':
    case 'failed-save':
      return [{ kind: 'effect-reference', effectId: primaryEffectId, amount: 'full' }]
    case 'successful-save':
      return [{ kind: 'effect-reference', effectId: primaryEffectId, amount: 'half' }]
    case 'miss':
    case 'failed-or-successful-save':
      return []
    default: {
      const _exhaustive: never = result
      return _exhaustive
    }
  }
}

/** Authoring defaults for all method-derived slots when the first effect is created. */
export function buildDefaultOutcomeSlots(
  method: ResolutionMethodRef,
  primaryEffectId: ResolutionEffectId,
): Array<{
  result: ResolutionOutcomeResult
  effects: ResolutionEffectReference[]
}> {
  return getOutcomeResultsForMethod(method).map((result) => ({
    result,
    effects: defaultEffectReferencesForResult(result, primaryEffectId),
  }))
}

/** Stored-shaped outcomes with empty slots removed. */
export function stripEmptyOutcomeSlots<T extends OutcomeLike>(outcomes: readonly T[]): T[] {
  return outcomes.filter(hasMeaningfulOutcomeContent)
}
