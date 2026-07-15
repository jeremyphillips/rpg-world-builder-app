import type { ResolutionSelectionState } from './selection-types'
import type { EffectRecipient, EffectRowFormatOptions } from '../effects/format'
import type { SpellResolution } from './schema'
import type { SpellResolutionSelectionMode } from './vocab'

export type { EffectRecipient }

function deriveRecipientFromModeAndArea(
  selectionMode: SpellResolutionSelectionMode,
  hasAreaOfEffect: boolean,
): EffectRecipient {
  switch (selectionMode) {
    case 'self':
      return hasAreaOfEffect ? 'area' : 'self'
    case 'point':
      return hasAreaOfEffect ? 'area' : 'generic'
    case 'targets':
      return 'target'
    case 'none':
      return 'generic'
    default: {
      const _exhaustive: never = selectionMode
      return _exhaustive
    }
  }
}

/** Derives effect recipient from a stored resolution envelope. */
export function deriveEffectRecipientFromResolution(resolution: SpellResolution): EffectRecipient {
  return deriveRecipientFromModeAndArea(resolution.selectionMode, Boolean(resolution.areaOfEffect))
}

/**
 * Derives effect recipient from flattened authoring state or legacy proximity fields.
 *
 * When `selectionMode` is present it is authoritative together with `hasAreaOfEffect`.
 */
export function deriveDefaultEffectRecipient(
  context: Pick<
    ResolutionSelectionState,
    'selectionMode' | 'hasAreaOfEffect' | 'targetKind' | 'targetCount'
  > & {
    proximityKind?: ResolutionSelectionState['proximityKind']
  },
): EffectRecipient {
  if (context.selectionMode) {
    return deriveRecipientFromModeAndArea(context.selectionMode, Boolean(context.hasAreaOfEffect))
  }

  if (context.proximityKind === 'self') return 'self'
  if (isResolutionTargetConfigured(context)) return 'target'
  return 'generic'
}

/** True when proximity and target kind/count are present for an external target. */
export function isResolutionTargetConfigured(
  context: Pick<ResolutionSelectionState, 'targetKind' | 'targetCount'> & {
    proximityKind?: ResolutionSelectionState['proximityKind']
  },
): boolean {
  if (context.proximityKind === 'self') return false
  if (!context.targetKind) return false
  if (context.targetCount === undefined || context.targetCount < 1) return false
  return true
}

/** Shared recipient/register options for resolution preview and outcome sentences. */
export function resolutionEffectFormatOptions(
  resolution: SpellResolution,
  overrides: Partial<EffectRowFormatOptions> = {},
): EffectRowFormatOptions {
  return {
    recipient: deriveEffectRecipientFromResolution(resolution),
    targetKind: resolution.target?.kind,
    register: 'resolution-preview',
    ...overrides,
  }
}
