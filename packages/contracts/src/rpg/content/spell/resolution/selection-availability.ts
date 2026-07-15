import type { SpellResolutionProximityKind } from './vocab'
import {
  getEffectTargetAvailability,
  isEffectKindAllowedForTarget,
} from './effect-target-compatibility'
import {
  getSelectionMethodCompatibility,
  getSelectionMethodCompatibilityReasonCode,
  methodOptionToMethodKind,
  resolveSelectionModeFromState,
  selectionMethodContextFromState,
} from './selection-method-compatibility'
import type {
  OptionAvailability,
  ResolutionApplicationPatternFormKind,
  ResolutionEffectKind,
  ResolutionMethodOption,
  ResolutionPatch,
  ResolutionSelectionState,
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

export function stateAfterPatch(
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

/** Target proximity gates method/pattern only for external target selection. */
function isProximityRelevantForAvailability(context: ResolutionSelectionState): boolean {
  if (context.selectionMode) return context.selectionMode === 'targets'
  return context.proximityKind !== undefined && context.proximityKind !== 'self'
}

export function isResolutionEffectKind(kind: string): kind is ResolutionEffectKind {
  return kind === 'damage' || kind === 'healing' || kind === 'temporary-hit-points'
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
  const selectionContext = selectionMethodContextFromState(context)
  if (selectionContext) {
    const methodKind = methodOptionToMethodKind(method)
    const compatibility = getSelectionMethodCompatibility(selectionContext, methodKind)
    if (compatibility !== 'supported') {
      const reasonCode = getSelectionMethodCompatibilityReasonCode(selectionContext, methodKind)
      const selectionMode = resolveSelectionModeFromState(context)
      if (reasonCode && selectionMode) {
        return {
          allowed: false,
          reason: {
            code: 'method-incompatible-with-selection-mode',
            method,
            selectionMode,
            hasAreaOfEffect: Boolean(context.hasAreaOfEffect),
            compatibility,
            reasonCode,
          },
          severity: 'unsupported',
        }
      }
    }
  }

  if (!isProximityRelevantForAvailability(context)) {
    return { allowed: true }
  }

  const proximity = context.proximityKind
  if (!proximity || isMethodAllowedForProximity(method, proximity)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: {
      code: 'method-incompatible-with-proximity',
      method,
      proximity,
    },
    severity: 'unsupported',
  }
}

export function getApplicationPatternAvailability(
  context: ResolutionSelectionState,
  pattern: ResolutionApplicationPatternFormKind,
): OptionAvailability {
  if (!isProximityRelevantForAvailability(context)) {
    return { allowed: true }
  }

  const proximity = context.proximityKind
  if (!proximity || isPatternAllowedForProximity(pattern, proximity)) {
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
  if (!isEffectKindAllowedForMethod(kind, method)) {
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

  return getEffectTargetAvailability(context, kind)
}

export function isEffectKindAllowedForState(
  state: ResolutionSelectionState,
  kind: ResolutionEffectKind,
): boolean {
  return (
    isEffectKindAllowedForMethod(kind, toMethodOption(state)) &&
    isEffectKindAllowedForTarget(kind, state)
  )
}
