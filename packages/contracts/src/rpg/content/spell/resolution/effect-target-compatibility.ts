import type {
  OptionAvailability,
  ResolutionEffectKind,
  ResolutionSelectionState,
} from './selection-types'
import type { SpellResolutionTargetKind } from './vocab'

export const CREATURE_ONLY_RESOLUTION_EFFECT_KINDS = [
  'healing',
  'temporary-hit-points',
] as const satisfies readonly ResolutionEffectKind[]

export type CreatureOnlyResolutionEffectKind =
  (typeof CREATURE_ONLY_RESOLUTION_EFFECT_KINDS)[number]

export type EffectTargetCompatibilityContext = Pick<
  ResolutionSelectionState,
  'proximityKind' | 'targetKind' | 'targetCount'
>

export function isCreatureOnlyResolutionEffectKind(
  kind: ResolutionEffectKind,
): kind is CreatureOnlyResolutionEffectKind {
  return CREATURE_ONLY_RESOLUTION_EFFECT_KINDS.includes(kind as CreatureOnlyResolutionEffectKind)
}

/** Creature-only effects (healing, THP) require a creature target unless self-targeted. */
export function isEffectKindAllowedForTarget(
  kind: ResolutionEffectKind,
  context: EffectTargetCompatibilityContext,
): boolean {
  if (!isCreatureOnlyResolutionEffectKind(kind)) return true
  if (context.proximityKind === 'self') return true
  if (!context.targetKind) return true
  return context.targetKind === 'creature'
}

export function getEffectTargetAvailability(
  context: EffectTargetCompatibilityContext,
  kind: ResolutionEffectKind,
): OptionAvailability {
  if (isEffectKindAllowedForTarget(kind, context)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: {
      code: 'effect-kind-incompatible-with-target',
      kind,
      targetKind: context.targetKind as SpellResolutionTargetKind,
    },
    severity: 'unsupported',
  }
}
