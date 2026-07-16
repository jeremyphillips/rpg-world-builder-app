import type { SpellResolutionProximityKind } from './vocab'
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

export function isEffectKindAllowedForState(
  state: ResolutionSelectionState,
  kind: ResolutionEffectKind,
): boolean {
  return isEffectKindAllowedForMethod(kind, toMethodOption(state))
}
