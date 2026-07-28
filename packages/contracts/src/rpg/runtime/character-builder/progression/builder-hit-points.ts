import type { CharacterClass } from '../../../content/classes/class'
import { abilityModifier } from '../../character/derive/index'
import { resolveMaxHpAtLevel } from '../../character/derive/hit-points-at-level'
import type { CharacterBuilderDraft } from '../draft/draft'

// ---------------------------------------------------------------------------
// Builder HP — calculation config is builder-only; only resulting HP is persisted.
// ---------------------------------------------------------------------------

export type HitPointValueSource =
  | { type: 'derived'; method: 'average' | 'max' }
  | { type: 'manual'; value: number }

/** Default builder HP source until manual or rolled history UI exists. */
export const DEFAULT_BUILDER_HIT_POINT_SOURCE: HitPointValueSource = {
  type: 'derived',
  method: 'average',
}

export type ResolveBuilderMaxHitPointsOptions = {
  source?: HitPointValueSource
}

/** Mechanical max HP for preview and finalize — does not initialize current/temporary. */
export function resolveBuilderMaxHitPoints(
  draft: CharacterBuilderDraft,
  characterClass: CharacterClass,
  options: ResolveBuilderMaxHitPointsOptions = {},
): number {
  const source = options.source ?? DEFAULT_BUILDER_HIT_POINT_SOURCE

  if (source.type === 'manual') {
    return Math.max(1, source.value)
  }

  const conScore = draft.abilities.scores?.con
  const constitutionModifier = typeof conScore === 'number' ? abilityModifier(conScore) : 0

  return resolveMaxHpAtLevel({
    hitDie: characterClass.hitDie,
    constitutionModifier,
    level: draft.class.level,
    method: source.method,
  })
}
