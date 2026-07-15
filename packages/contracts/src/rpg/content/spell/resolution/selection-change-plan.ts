import type {
  IncompatibleSelection,
  ResolutionChangePlan,
  ResolutionChangeRequest,
  ResolutionEffectKind,
  ResolutionEffectRef,
  ResolutionPatch,
  ResolutionSelectionState,
  ResolutionWarning,
} from './selection-types'
import {
  outcomeApplicationsReferenceEffect,
  planOutcomeMethodChange,
  stripEffectFromOutcomes,
} from './outcome-change-plan'
import {
  applyMethodOptionPatch,
  getApplicationPatternAvailability,
  getMethodAvailability,
  isEffectKindAllowedForState,
  isResolutionEffectKind,
  stateAfterPatch,
  toMethodOption,
} from './selection-availability'
import {
  isCreatureOnlyResolutionEffectKind,
  isEffectKindAllowedForTarget,
} from './effect-target-compatibility'

function buildProximityCleanupPatch(
  before: ResolutionSelectionState,
  nextProximity: ResolutionSelectionState['proximityKind'],
): ResolutionPatch {
  const patch: ResolutionPatch = {}

  if (nextProximity !== 'distance' && before.proximityDistanceFt !== undefined) {
    patch.proximityDistanceFt = undefined
  }

  if (nextProximity !== 'reach' && before.proximityReachDistanceFt !== undefined) {
    patch.proximityReachDistanceFt = undefined
  }

  return patch
}

function buildMethodCleanupPatch(
  before: ResolutionSelectionState,
  after: ResolutionSelectionState,
): ResolutionPatch {
  const patch: ResolutionPatch = {}

  if (after.methodKind !== 'saving-throw' && before.saveAbility !== undefined) {
    patch.saveAbility = undefined
  }

  if (after.methodKind !== 'attack' && before.attackType !== undefined) {
    patch.attackType = undefined
  }

  return patch
}

function buildPatternCleanupPatch(
  before: ResolutionSelectionState,
  after: ResolutionSelectionState,
): ResolutionPatch {
  if (after.applicationPatternKind !== 'none') return {}

  const patch: ResolutionPatch = {}
  if (before.projectileCount !== undefined) patch.projectileCount = undefined
  if (before.projectileUnitLabelSingular !== undefined) {
    patch.projectileUnitLabelSingular = undefined
  }
  if (before.projectileUnitLabelPlural !== undefined) {
    patch.projectileUnitLabelPlural = undefined
  }
  return patch
}

function findIncompatibleMethod(
  state: ResolutionSelectionState,
): IncompatibleSelection | undefined {
  const current = toMethodOption(state)
  if (!current) return undefined
  if (getMethodAvailability(state, current).allowed) return undefined
  return { field: 'method', currentOption: current }
}

function findIncompatiblePattern(
  state: ResolutionSelectionState,
): IncompatibleSelection | undefined {
  if (state.applicationPatternKind !== 'projectiles') return undefined
  if (getApplicationPatternAvailability(state, 'projectiles').allowed) return undefined
  return { field: 'applicationPattern', currentKind: 'projectiles' }
}

function findEffectsToRemove(state: ResolutionSelectionState): ResolutionEffectRef[] {
  const effects = state.effects ?? []
  return effects.filter((effect) => {
    if (!isResolutionEffectKind(effect.kind)) return false
    return !isEffectKindAllowedForState(state, effect.kind)
  })
}

function collectIncompatibleSelections(state: ResolutionSelectionState): IncompatibleSelection[] {
  const selections: IncompatibleSelection[] = []
  const method = findIncompatibleMethod(state)
  if (method) selections.push(method)
  const pattern = findIncompatiblePattern(state)
  if (pattern) selections.push(pattern)
  return selections
}

function countEffectsByKind(
  effects: readonly { kind: string }[],
  kind: ResolutionEffectKind,
): number {
  return effects.filter((effect) => effect.kind === kind).length
}

function maybeSelfWithDamageWarning(
  state: ResolutionSelectionState,
): ResolutionWarning | undefined {
  const effects = state.effects ?? []
  if (state.proximityKind === 'self' && effects.some((effect) => effect.kind === 'damage')) {
    return { code: 'self-with-damage' }
  }
  return undefined
}

function maybeAutomaticDistanceWithoutPatternWarning(
  state: ResolutionSelectionState,
): ResolutionWarning | undefined {
  const method = toMethodOption(state)
  if (
    state.proximityKind === 'distance' &&
    method === 'automatic' &&
    state.applicationPatternKind !== 'projectiles'
  ) {
    return { code: 'automatic-distance-without-pattern' }
  }
  return undefined
}

function maybeCheckWithoutDamageWarning(
  state: ResolutionSelectionState,
): ResolutionWarning | undefined {
  const effects = state.effects ?? []
  const method = toMethodOption(state)
  if (
    (method === 'melee-spell' || method === 'ranged-spell' || method === 'saving-throw') &&
    !effects.some((effect) => effect.kind === 'damage')
  ) {
    return { code: 'check-without-damage-effect' }
  }
  return undefined
}

function maybeMultipleEffectsWarning(
  effects: readonly { kind: string }[],
  kind: ResolutionEffectKind,
  code: 'multiple-healing-effects' | 'multiple-temporary-hit-points-effects',
): ResolutionWarning | undefined {
  if (countEffectsByKind(effects, kind) > 1) {
    return { code }
  }
  return undefined
}

function maybeCreatureOnlyEffectWithNonCreatureTargetWarning(
  state: ResolutionSelectionState,
): ResolutionWarning | undefined {
  if (state.proximityKind === 'self') return undefined
  if (!state.targetKind || state.targetKind === 'creature') return undefined

  const effects = state.effects ?? []
  if (
    effects.some(
      (effect) =>
        isResolutionEffectKind(effect.kind) &&
        isCreatureOnlyResolutionEffectKind(effect.kind) &&
        !isEffectKindAllowedForTarget(effect.kind, state),
    )
  ) {
    return { code: 'creature-only-effect-with-non-creature-target' }
  }

  return undefined
}

function collectWarnings(state: ResolutionSelectionState): ResolutionWarning[] {
  const effects = state.effects ?? []
  return [
    maybeSelfWithDamageWarning(state),
    maybeAutomaticDistanceWithoutPatternWarning(state),
    maybeCheckWithoutDamageWarning(state),
    maybeCreatureOnlyEffectWithNonCreatureTargetWarning(state),
    maybeMultipleEffectsWarning(effects, 'healing', 'multiple-healing-effects'),
    maybeMultipleEffectsWarning(
      effects,
      'temporary-hit-points',
      'multiple-temporary-hit-points-effects',
    ),
  ].filter((warning): warning is ResolutionWarning => warning !== undefined)
}

function buildRequestedPatch(
  before: ResolutionSelectionState,
  change: ResolutionChangeRequest,
): ResolutionPatch {
  switch (change.field) {
    case 'selectionMode':
      return { selectionMode: change.value }
    case 'proximityKind':
      return { proximityKind: change.value }
    case 'methodOption':
      return applyMethodOptionPatch(before, change.value)
    case 'applicationPatternKind':
      return { applicationPatternKind: change.value }
    case 'removeEffect':
      return {}
    default: {
      const _exhaustive: never = change
      return _exhaustive
    }
  }
}

function findEffectRemovalTargets(
  state: ResolutionSelectionState,
  effectId: string,
): ResolutionEffectRef[] {
  const effect = state.effects?.find((entry) => entry.id === effectId)
  if (!effect) return []
  if (!outcomeApplicationsReferenceEffect(state.outcomes, effectId)) return []
  return [effect]
}

/** Returns true when author confirmation is required before applying the plan. */
export function resolutionChangeRequiresConfirm(plan: ResolutionChangePlan): boolean {
  return (
    plan.incompatibleSelections.length > 0 ||
    plan.effectsToRemove.length > 0 ||
    plan.discardedOutcomeBranches.length > 0
  )
}

/**
 * Plans a resolution field change without silently replacing semantic selections.
 * Safe dependent-field cleanup is returned separately in `cleanupPatch`.
 */
export function planResolutionChange(
  before: ResolutionSelectionState,
  change: ResolutionChangeRequest,
): ResolutionChangePlan {
  if (change.field === 'removeEffect') {
    const effectsToRemove = findEffectRemovalTargets(before, change.effectId)
    return {
      requestedPatch: {},
      cleanupPatch: {},
      incompatibleSelections: [],
      effectsToRemove,
      discardedOutcomeBranches: [],
      outcomePatch: effectsToRemove.length
        ? { outcomes: stripEffectFromOutcomes(before.outcomes ?? [], change.effectId) }
        : undefined,
      warnings: collectWarnings(before),
    }
  }

  const requestedPatch = buildRequestedPatch(before, change)
  let after = stateAfterPatch(before, requestedPatch)

  const proximityCleanup =
    change.field === 'proximityKind' ? buildProximityCleanupPatch(before, change.value) : {}

  after = stateAfterPatch(after, proximityCleanup)

  const methodCleanup =
    change.field === 'methodOption' ? buildMethodCleanupPatch(before, after) : {}
  after = stateAfterPatch(after, methodCleanup)

  const patternCleanup =
    change.field === 'applicationPatternKind' && change.value === 'none'
      ? buildPatternCleanupPatch(before, after)
      : {}

  after = stateAfterPatch(after, patternCleanup)

  const cleanupPatch: ResolutionPatch = {
    ...proximityCleanup,
    ...methodCleanup,
    ...patternCleanup,
  }

  const incompatibleSelections = collectIncompatibleSelections(after)
  const effectsToRemove = findEffectsToRemove(after)
  const warnings = collectWarnings(after)

  const outcomePlan =
    change.field === 'methodOption'
      ? planOutcomeMethodChange(before, change.value)
      : { discardedBranches: [], mappedOutcomes: before.outcomes ?? [] }

  return {
    requestedPatch,
    cleanupPatch,
    incompatibleSelections,
    effectsToRemove,
    discardedOutcomeBranches: outcomePlan.discardedBranches,
    outcomePatch:
      change.field === 'methodOption' ? { outcomes: outcomePlan.mappedOutcomes } : undefined,
    warnings,
  }
}

/** Patch applied on confirm to clear incompatible semantic selections. */
export function buildIncompatibleSelectionClearPatch(
  selections: readonly IncompatibleSelection[],
): ResolutionPatch {
  const patch: ResolutionPatch = {}

  for (const selection of selections) {
    if (selection.field === 'method') {
      patch.methodKind = undefined
      patch.attackType = undefined
      patch.saveAbility = undefined
    }
    if (selection.field === 'applicationPattern') {
      patch.applicationPatternKind = 'none'
      patch.projectileCount = undefined
      patch.projectileUnitLabelSingular = undefined
      patch.projectileUnitLabelPlural = undefined
    }
  }

  return patch
}

/** Structural dependent-field cleanup — idempotent, no semantic substitution. */
export function applyResolutionStructuralCleanup(state: ResolutionSelectionState): ResolutionPatch {
  const after = stateAfterPatch(state, {})
  return {
    ...buildProximityCleanupPatch(state, state.proximityKind),
    ...buildMethodCleanupPatch(state, after),
    ...buildPatternCleanupPatch(state, after),
  }
}
