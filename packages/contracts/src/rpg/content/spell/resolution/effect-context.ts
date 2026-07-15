import type { ResolutionSelectionState } from './selection-types'
import type { EffectRecipient, EffectRowFormatOptions } from '../effects/format'
import type { SpellResolution } from './schema'

export type { EffectRecipient }

/**
 * MVP assumption — not authoritative for future recipient modeling.
 *
 * Until explicit effect recipients are modeled, resolution effects are assumed
 * to apply to the resolution target, except self-targeted resolutions, which
 * apply to the caster.
 *
 * Future recipients (caster, another creature, area targets) will extend this
 * module — not rename it to sound authoritative today.
 */
export function deriveDefaultEffectRecipient(
  context: Pick<ResolutionSelectionState, 'proximityKind' | 'targetKind' | 'targetCount'>,
): EffectRecipient {
  if (context.proximityKind === 'self') return 'self'
  if (isResolutionTargetConfigured(context)) return 'target'
  return 'generic'
}

/** True when proximity and target kind/count are present for an external target. */
export function isResolutionTargetConfigured(
  context: Pick<ResolutionSelectionState, 'proximityKind' | 'targetKind' | 'targetCount'>,
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
    recipient: deriveDefaultEffectRecipient({
      proximityKind: resolution.target.proximity.kind,
      targetKind: resolution.target.kind,
      targetCount: resolution.target.count,
    }),
    targetKind: resolution.target.kind,
    register: 'resolution-preview',
    ...overrides,
  }
}
