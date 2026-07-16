import type { z } from 'zod'

import { spellResolutionValidationMessages } from './validation-messages'
import type { SpellResolutionMethod } from './schema'
import type { ResolutionMethodOption, ResolutionSelectionState } from './selection-types'
import type { SpellResolutionSelectionMode } from './vocab'

/** Structural resolution method kind — attack covers melee and ranged spell options. */
export type ResolutionMethodKind = SpellResolutionMethod['kind']

export type SelectionMethodCompatibility = 'supported' | 'deferred' | 'unsupported'

/** Matrix row key — self splits on whether area occupants receive effects. */
export type SelectionMethodContextKey =
  | 'targets'
  | 'point'
  | 'self-without-area'
  | 'self-with-area'
  | 'none'

export const SELECTION_METHOD_COMPATIBILITY_REASON_CODES = {
  'attack-deferred-for-point-selection': 'point-origin-attack-resolution',
  'attack-unsupported-for-self-without-area': 'self-recipient-attack-resolution',
  'attack-deferred-for-self-with-area': 'self-origin-attack-resolution',
  'saving-throw-deferred-for-self-without-area': 'self-recipient-saving-throw-resolution',
  'attack-unsupported-for-none-selection': 'none-selection-attack-resolution',
  'saving-throw-unsupported-for-none-selection': 'none-selection-saving-throw-resolution',
} as const

export type SelectionMethodCompatibilityReasonCode =
  keyof typeof SELECTION_METHOD_COMPATIBILITY_REASON_CODES

type CompatibilityCell =
  | { compatibility: 'supported' }
  | {
      compatibility: 'deferred' | 'unsupported'
      reasonCode: SelectionMethodCompatibilityReasonCode
    }

export const SELECTION_METHOD_COMPATIBILITY_MATRIX: Record<
  SelectionMethodContextKey,
  Record<ResolutionMethodKind, CompatibilityCell>
> = {
  targets: {
    attack: { compatibility: 'supported' },
    'saving-throw': { compatibility: 'supported' },
    automatic: { compatibility: 'supported' },
  },
  point: {
    attack: {
      compatibility: 'deferred',
      reasonCode: 'attack-deferred-for-point-selection',
    },
    'saving-throw': { compatibility: 'supported' },
    automatic: { compatibility: 'supported' },
  },
  'self-without-area': {
    attack: {
      compatibility: 'unsupported',
      reasonCode: 'attack-unsupported-for-self-without-area',
    },
    'saving-throw': {
      compatibility: 'deferred',
      reasonCode: 'saving-throw-deferred-for-self-without-area',
    },
    automatic: { compatibility: 'supported' },
  },
  'self-with-area': {
    attack: {
      compatibility: 'deferred',
      reasonCode: 'attack-deferred-for-self-with-area',
    },
    'saving-throw': { compatibility: 'supported' },
    automatic: { compatibility: 'supported' },
  },
  none: {
    attack: {
      compatibility: 'unsupported',
      reasonCode: 'attack-unsupported-for-none-selection',
    },
    'saving-throw': {
      compatibility: 'unsupported',
      reasonCode: 'saving-throw-unsupported-for-none-selection',
    },
    automatic: { compatibility: 'supported' },
  },
}

export function methodOptionToMethodKind(option: ResolutionMethodOption): ResolutionMethodKind {
  if (option === 'automatic') return 'automatic'
  if (option === 'saving-throw') return 'saving-throw'
  return 'attack'
}

export function resolveSelectionMethodContextKey(input: {
  selectionMode: SpellResolutionSelectionMode
  hasAreaOfEffect: boolean
}): SelectionMethodContextKey {
  if (input.selectionMode === 'self') {
    return input.hasAreaOfEffect ? 'self-with-area' : 'self-without-area'
  }
  if (input.selectionMode === 'targets') return 'targets'
  if (input.selectionMode === 'point') return 'point'
  return 'none'
}

function inferSelectionModeFromState(
  state: Pick<
    ResolutionSelectionState,
    'selectionMode' | 'proximityKind' | 'originDistanceFt' | 'targetKind' | 'targetCount'
  >,
): SpellResolutionSelectionMode | undefined {
  if (state.selectionMode) return state.selectionMode
  if (state.proximityKind === 'self') return 'self'
  if (state.originDistanceFt !== undefined) return 'point'
  if (state.targetKind !== undefined || state.targetCount !== undefined) return 'targets'
  return undefined
}

/** Resolves explicit or legacy-inferred selection mode for policy checks. */
export function resolveSelectionModeFromState(
  state: Pick<
    ResolutionSelectionState,
    'selectionMode' | 'proximityKind' | 'originDistanceFt' | 'targetKind' | 'targetCount'
  >,
): SpellResolutionSelectionMode | undefined {
  return inferSelectionModeFromState(state)
}

/** Derives the matrix row for authoring policy and availability checks. */
export function selectionMethodContextFromState(
  state: Pick<
    ResolutionSelectionState,
    | 'selectionMode'
    | 'hasAreaOfEffect'
    | 'proximityKind'
    | 'originDistanceFt'
    | 'targetKind'
    | 'targetCount'
  >,
): SelectionMethodContextKey | undefined {
  const selectionMode = inferSelectionModeFromState(state)
  if (!selectionMode) return undefined

  return resolveSelectionMethodContextKey({
    selectionMode,
    hasAreaOfEffect: Boolean(state.hasAreaOfEffect),
  })
}

export function getSelectionMethodCompatibility(
  context: SelectionMethodContextKey,
  methodKind: ResolutionMethodKind,
): SelectionMethodCompatibility {
  return SELECTION_METHOD_COMPATIBILITY_MATRIX[context][methodKind].compatibility
}

export function getSelectionMethodCompatibilityReasonCode(
  context: SelectionMethodContextKey,
  methodKind: ResolutionMethodKind,
): SelectionMethodCompatibilityReasonCode | undefined {
  const cell = SELECTION_METHOD_COMPATIBILITY_MATRIX[context][methodKind]
  if (cell.compatibility === 'supported') return undefined
  return cell.reasonCode
}

/** Capability gate id for deferred combinations — used by future explanatory UI. */
export function getSelectionMethodCapabilityRequired(
  reasonCode: SelectionMethodCompatibilityReasonCode,
): string {
  return SELECTION_METHOD_COMPATIBILITY_REASON_CODES[reasonCode]
}

/** MVP authoring gate — only `supported` combinations are allowed. */
export function isSelectionMethodAllowed(
  context: SelectionMethodContextKey,
  methodKind: ResolutionMethodKind,
): boolean {
  return getSelectionMethodCompatibility(context, methodKind) === 'supported'
}

export type SelectionMethodCompatibilityInput = {
  selectionMode: SpellResolutionSelectionMode
  hasAreaOfEffect: boolean
  method: SpellResolutionMethod
}

/** Rejects deferred and unsupported method × selection-mode pairs on stored resolution. */
export function validateSpellResolutionMethodCompatibility(
  resolution: SelectionMethodCompatibilityInput,
  ctx: z.RefinementCtx,
): void {
  const context = resolveSelectionMethodContextKey({
    selectionMode: resolution.selectionMode,
    hasAreaOfEffect: resolution.hasAreaOfEffect,
  })
  const compatibility = getSelectionMethodCompatibility(context, resolution.method.kind)
  if (compatibility === 'supported') return

  const reasonCode = getSelectionMethodCompatibilityReasonCode(context, resolution.method.kind)
  if (!reasonCode) return

  ctx.addIssue({
    code: 'custom',
    message: spellResolutionValidationMessages.methodIncompatibleWithSelectionMode({
      compatibility,
      reasonCode,
      methodKind: resolution.method.kind,
      selectionContext: context,
    }),
    path: ['method', 'kind'],
  })
}
