import type { ClassHitDie } from '../../../primitives/dice'
import type { Ability } from '../../../vocab/ability'
// ---------------------------------------------------------------------------
// Derived stat helpers — pure functions over raw scores and catalog data.
//
// Rules:
//   - Take primitive values or catalog types as parameters; no UI, store, or
//     API imports.
//   - Never mutate inputs; always return a new value.
//   - Keep each function to a single formula so cyclomatic stays at 1.
//
// buildCharacterPreview composes deriveCharacterProfile via preview-adapter.ts.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Ability modifier — the fundamental formula underlying every derived stat.
// ---------------------------------------------------------------------------

export { abilityModifier } from '../../creature/ability-modifier'
import { abilityModifier } from '../../creature/ability-modifier'

// ---------------------------------------------------------------------------
// Hit points
// ---------------------------------------------------------------------------

/**
 * Level-1 maximum HP: hit die max + CON modifier.
 * Single class only — multiclass HP aggregation lives in buildCharacterPreview.
 */
export function levelOneMaxHp(hitDie: ClassHitDie, conScore: number): number {
  return resolveLevelOneMaxHp({ hitDie, conScore })
}

export type ResolveLevelOneMaxHpInput = {
  hitDie: ClassHitDie
  conScore: number | undefined
  /** Used when `conScore` is unset — preview default, not an assigned ability score. */
  defaultConModifier?: number
}

/** Resolves level-1 max HP, applying a neutral CON modifier when no score is set. */
export function resolveLevelOneMaxHp({
  hitDie,
  conScore,
  defaultConModifier = 0,
}: ResolveLevelOneMaxHpInput): number {
  const conModifier = typeof conScore === 'number' ? abilityModifier(conScore) : defaultConModifier
  return Math.max(1, hitDie + conModifier)
}

// ---------------------------------------------------------------------------
// Saving throws
// ---------------------------------------------------------------------------

/**
 * Returns true when the given ability is covered by the class's saving throw
 * proficiencies list.
 */
export function hasSavingThrowProficiency(
  ability: Ability,
  classSavingThrows: readonly Ability[],
): boolean {
  return classSavingThrows.includes(ability)
}

/**
 * Saving throw bonus for one ability.
 * Proficient characters add the proficiency bonus; non-proficient don't.
 */
export { savingThrowBonus, skillModifier } from '../../creature/checks'

// ---------------------------------------------------------------------------
// Spellcasting
// ---------------------------------------------------------------------------

export { abilitySaveDc, spellAttackBonus } from '../../creature/spell-dc'

export * from './armor-class'
export * from './hit-points-at-level'
export * from './preview-equipped-armor'
export * from './profile'
export * from './sheet-derivation-input'
export * from './weapon-attack'
