import type {
  SpellResolutionApplication,
  SpellResolutionEffectId,
  SpellResolutionMethod,
} from './schema'
import type { ResolutionEffectKind } from './selection-types'
import type { SpellResolutionOutcomeResult } from './vocab'

// ---------------------------------------------------------------------------
// Method-derived outcome slots — shared by stored validation and form adapters.
// ---------------------------------------------------------------------------

export type OutcomeLike = {
  result: SpellResolutionOutcomeResult
  applications: readonly unknown[]
  note?: string
}

/** Outcome results rendered for a resolution method, in stable display order. */
export function getOutcomeResultsForMethod(
  method: SpellResolutionMethod,
): readonly SpellResolutionOutcomeResult[] {
  switch (method.kind) {
    case 'automatic':
      return ['applied']
    case 'attack':
      return ['hit', 'miss']
    case 'saving-throw':
      return ['failed-save', 'successful-save']
    default: {
      const _exhaustive: never = method
      return _exhaustive
    }
  }
}

/** True when an outcome has at least one application or non-empty prose. */
export function hasMeaningfulOutcomeContent(outcome: OutcomeLike): boolean {
  return outcome.applications.length > 0 || Boolean(outcome.note?.trim())
}

/** True when an outcome has neither applications nor prose. */
export function isOutcomeEmpty(outcome: OutcomeLike): boolean {
  return !hasMeaningfulOutcomeContent(outcome)
}

export function findOutcomeByResult<T extends OutcomeLike>(
  outcomes: readonly T[],
  result: SpellResolutionOutcomeResult,
): T | undefined {
  return outcomes.find((outcome) => outcome.result === result)
}

/** Reorders outcomes to match method-defined slot order; drops results outside the method. */
export function normalizeOutcomeOrder<T extends OutcomeLike>(
  method: SpellResolutionMethod,
  outcomes: readonly T[],
): T[] {
  const allowed = new Set(getOutcomeResultsForMethod(method))
  const byResult = new Map(
    outcomes
      .filter((outcome) => allowed.has(outcome.result))
      .map((outcome) => [outcome.result, outcome]),
  )

  return getOutcomeResultsForMethod(method)
    .map((result) => byResult.get(result))
    .filter((outcome): outcome is T => outcome !== undefined)
}

/** Merges stored outcomes with empty method-derived slots; preserves all authored data. */
export function ensureOutcomeSlotsForMethod<T extends OutcomeLike>(
  method: SpellResolutionMethod,
  outcomes: readonly T[],
  createEmptySlot: (result: SpellResolutionOutcomeResult) => T,
): T[] {
  const allowed = new Set(getOutcomeResultsForMethod(method))
  const byResult = new Map(
    outcomes
      .filter((outcome) => allowed.has(outcome.result))
      .map((outcome) => [outcome.result, outcome]),
  )

  return getOutcomeResultsForMethod(method).map(
    (result) => byResult.get(result) ?? createEmptySlot(result),
  )
}

/** Effect kinds that support `amount: 'half'` in the resolution MVP. */
export function effectKindsSupportingPartialApplication(): readonly ResolutionEffectKind[] {
  return ['damage']
}

export function supportsPartialApplicationForEffectKind(kind: string): boolean {
  return effectKindsSupportingPartialApplication().includes(kind as ResolutionEffectKind)
}

function defaultApplicationsForResult(
  result: SpellResolutionOutcomeResult,
  primaryEffectId: SpellResolutionEffectId,
): SpellResolutionApplication[] {
  switch (result) {
    case 'applied':
    case 'hit':
    case 'failed-save':
      return [{ effectId: primaryEffectId, amount: 'full' }]
    case 'successful-save':
      return [{ effectId: primaryEffectId, amount: 'half' }]
    case 'miss':
      return []
    default: {
      const _exhaustive: never = result
      return _exhaustive
    }
  }
}

/** Authoring defaults for all method-derived slots when the first effect is created. */
export function buildDefaultOutcomeSlots(
  method: SpellResolutionMethod,
  primaryEffectId: SpellResolutionEffectId,
): Array<{
  result: SpellResolutionOutcomeResult
  applications: SpellResolutionApplication[]
  note?: string
}> {
  return getOutcomeResultsForMethod(method).map((result) => ({
    result,
    applications: defaultApplicationsForResult(result, primaryEffectId),
  }))
}

/** Stored-shaped outcomes with empty slots removed. */
export function stripEmptyOutcomeSlots<T extends OutcomeLike>(outcomes: readonly T[]): T[] {
  return outcomes.filter(hasMeaningfulOutcomeContent)
}
