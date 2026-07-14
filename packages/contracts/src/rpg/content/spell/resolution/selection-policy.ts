import type { SpellResolutionProximityKind } from './vocab'
import type {
  IncompatibleSelection,
  OptionAvailability,
  ResolutionApplicationPatternFormKind,
  ResolutionChangePlan,
  ResolutionChangeRequest,
  ResolutionEffectKind,
  ResolutionEffectRef,
  ResolutionMethodOption,
  ResolutionPatch,
  ResolutionSelectionState,
  ResolutionWarning,
} from './selection-types'

export const RESOLUTION_METHOD_OPTIONS = [
  'melee-spell',
  'ranged-spell',
  'saving-throw',
  'automatic',
] as const satisfies readonly ResolutionMethodOption[]

export function toMethodOption(
  state: ResolutionSelectionState,
): ResolutionMethodOption | undefined {
  if (state.methodKind === 'automatic') return 'automatic'
  if (state.methodKind === 'saving-throw') return 'saving-throw'
  if (state.methodKind === 'attack' && state.attackType) return state.attackType
  return undefined
}

export function applyMethodOptionPatch(
  state: ResolutionSelectionState,
  option: ResolutionMethodOption,
): ResolutionPatch {
  if (option === 'automatic') {
    return { methodKind: 'automatic', attackType: undefined, saveAbility: undefined }
  }

  if (option === 'saving-throw') {
    return {
      methodKind: 'saving-throw',
      saveAbility: state.saveAbility ?? 'con',
      attackType: undefined,
    }
  }

  return {
    methodKind: 'attack',
    attackType: option,
    saveAbility: undefined,
  }
}

function stateAfterPatch(
  before: ResolutionSelectionState,
  patch: ResolutionPatch,
): ResolutionSelectionState {
  return { ...before, ...patch }
}

function isMethodAllowedForProximity(
  method: ResolutionMethodOption,
  proximity: SpellResolutionProximityKind,
): boolean {
  switch (method) {
    case 'melee-spell':
      return proximity === 'touch' || proximity === 'reach'
    case 'ranged-spell':
      return proximity === 'distance'
    case 'saving-throw':
    case 'automatic':
      return true
    default: {
      const _exhaustive: never = method
      return _exhaustive
    }
  }
}

function isPatternAllowedForProximity(
  pattern: ResolutionApplicationPatternFormKind,
  proximity: SpellResolutionProximityKind,
): boolean {
  if (pattern === 'none') return true
  return proximity === 'distance'
}

function isEffectKindAllowedForMethod(
  kind: ResolutionEffectKind,
  method: ResolutionMethodOption | undefined,
): boolean {
  if (kind !== 'healing') return true
  return method !== 'ranged-spell'
}

export function getMethodAvailability(
  context: ResolutionSelectionState,
  method: ResolutionMethodOption,
): OptionAvailability {
  if (isMethodAllowedForProximity(method, context.proximityKind)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: {
      code: 'method-incompatible-with-proximity',
      method,
      proximity: context.proximityKind,
    },
    severity: 'unsupported',
  }
}

export function getApplicationPatternAvailability(
  context: ResolutionSelectionState,
  pattern: ResolutionApplicationPatternFormKind,
): OptionAvailability {
  if (isPatternAllowedForProximity(pattern, context.proximityKind)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: { code: 'pattern-requires-distance-proximity', pattern: 'projectiles' },
    severity: 'unsupported',
  }
}

export function getEffectKindAvailability(
  context: ResolutionSelectionState,
  kind: ResolutionEffectKind,
): OptionAvailability {
  const method = toMethodOption(context)
  if (isEffectKindAllowedForMethod(kind, method)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: {
      code: 'effect-kind-unsupported-for-method',
      kind,
      method: method ?? 'ranged-spell',
    },
    severity: 'unsupported',
  }
}

function buildProximityCleanupPatch(
  before: ResolutionSelectionState,
  nextProximity: SpellResolutionProximityKind,
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
  if (isMethodAllowedForProximity(current, state.proximityKind)) return undefined
  return { field: 'method', currentOption: current }
}

function findIncompatiblePattern(
  state: ResolutionSelectionState,
): IncompatibleSelection | undefined {
  if (state.applicationPatternKind !== 'projectiles') return undefined
  if (isPatternAllowedForProximity('projectiles', state.proximityKind)) return undefined
  return { field: 'applicationPattern', currentKind: 'projectiles' }
}

function findEffectsToRemove(state: ResolutionSelectionState): ResolutionEffectRef[] {
  const method = toMethodOption(state)
  const effects = state.effects ?? []
  return effects.filter((effect) => {
    if (!isResolutionEffectKind(effect.kind)) return false
    return !isEffectKindAllowedForMethod(effect.kind, method)
  })
}

function isResolutionEffectKind(kind: string): kind is ResolutionEffectKind {
  return kind === 'damage' || kind === 'healing' || kind === 'temporary-hit-points'
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

function collectWarnings(state: ResolutionSelectionState): ResolutionWarning[] {
  const effects = state.effects ?? []
  return [
    maybeSelfWithDamageWarning(state),
    maybeAutomaticDistanceWithoutPatternWarning(state),
    maybeCheckWithoutDamageWarning(state),
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
    case 'proximityKind':
      return { proximityKind: change.value }
    case 'methodOption':
      return applyMethodOptionPatch(before, change.value)
    case 'applicationPatternKind':
      return { applicationPatternKind: change.value }
    default: {
      const _exhaustive: never = change
      return _exhaustive
    }
  }
}

/** Returns true when author confirmation is required before applying the plan. */
export function resolutionChangeRequiresConfirm(plan: ResolutionChangePlan): boolean {
  return plan.incompatibleSelections.length > 0 || plan.effectsToRemove.length > 0
}

/**
 * Plans a resolution field change without silently replacing semantic selections.
 * Safe dependent-field cleanup is returned separately in `cleanupPatch`.
 */
export function planResolutionChange(
  before: ResolutionSelectionState,
  change: ResolutionChangeRequest,
): ResolutionChangePlan {
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

  return {
    requestedPatch,
    cleanupPatch,
    incompatibleSelections,
    effectsToRemove,
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
