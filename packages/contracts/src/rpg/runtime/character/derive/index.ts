import { DEFAULT_ARMOR_CLASS_BASE } from '../../../campaign/patches/campaign-mechanics-patch'
import type { ClassHitDie } from '../../../primitives/dice'
import type { Ability } from '../../../vocab/ability'
import type { ArmorClassBase } from '../../../vocab/mechanics/edition-preset-mechanics'
import type { CharacterSkillToolProficiencyRank } from '../proficiencies'

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

/** Standard D&D ability modifier: ⌊(score − 10) / 2⌋. */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// ---------------------------------------------------------------------------
// Hit points
// ---------------------------------------------------------------------------

/**
 * Level-1 maximum HP: hit die max + CON modifier.
 * Single class only — multiclass HP aggregation lives in buildCharacterPreview.
 */
export function levelOneMaxHp(hitDie: ClassHitDie, conScore: number): number {
  return hitDie + abilityModifier(conScore)
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
export function savingThrowBonus(
  abilityScore: number,
  isProficient: boolean,
  profBonus: number,
): number {
  return abilityModifier(abilityScore) + (isProficient ? profBonus : 0)
}

// ---------------------------------------------------------------------------
// Skill modifiers
// ---------------------------------------------------------------------------

/**
 * Skill modifier for a single skill.
 *
 * @param abilityScore - The score of the governing ability (e.g. STR for Athletics).
 * @param rank         - The character's proficiency rank, or `undefined` if not proficient.
 * @param profBonus    - Current proficiency bonus.
 */
export function skillModifier(
  abilityScore: number,
  rank: CharacterSkillToolProficiencyRank | undefined,
  profBonus: number,
): number {
  const base = abilityModifier(abilityScore)
  if (rank === 'expertise') return base + profBonus * 2
  if (rank === 'proficient') return base + profBonus
  return base
}

// ---------------------------------------------------------------------------
// Spellcasting
// ---------------------------------------------------------------------------

/**
 * Spell save DC: 8 + proficiency bonus + spellcasting ability modifier.
 * Pass the score of the class's designated spellcasting ability.
 */
export function spellSaveDc(spellcastingAbilityScore: number, profBonus: number): number {
  return 8 + profBonus + abilityModifier(spellcastingAbilityScore)
}

/**
 * Spell attack bonus: proficiency bonus + spellcasting ability modifier.
 */
export function spellAttackBonus(spellcastingAbilityScore: number, profBonus: number): number {
  return profBonus + abilityModifier(spellcastingAbilityScore)
}

// ---------------------------------------------------------------------------
// Armour class
// ---------------------------------------------------------------------------

/** Ruleset base AC before DEX or equipment adjustments (ascending mode). */
export function baseArmorClass(acBase: ArmorClassBase): number {
  return acBase
}

/** Unarmored AC from a ruleset base and a DEX modifier (may be neutral 0). */
export function unarmoredAcFromDexModifier(acBase: ArmorClassBase, dexModifier: number): number {
  return acBase + dexModifier
}

/**
 * Unarmored AC from a DEX score and ruleset base.
 * Equipment-based AC (armor + shield, Mage Armor, Unarmored Defense features)
 * is handled in the MVP-B derive extension (BENCH-088).
 */
export function unarmoredAc(
  dexScore: number,
  acBase: ArmorClassBase = DEFAULT_ARMOR_CLASS_BASE,
): number {
  return unarmoredAcFromDexModifier(acBase, abilityModifier(dexScore))
}

export type ResolveUnarmoredAcInput = {
  acBase: ArmorClassBase
  dexScore: number | undefined
  /** Used when `dexScore` is unset — preview default, not an assigned ability score. */
  defaultDexModifier?: number
}

/** Resolves unarmored AC, applying a neutral DEX modifier when no score is set. */
export function resolveUnarmoredAc({
  acBase,
  dexScore,
  defaultDexModifier = 0,
}: ResolveUnarmoredAcInput): number {
  const dexModifier = typeof dexScore === 'number' ? abilityModifier(dexScore) : defaultDexModifier
  return unarmoredAcFromDexModifier(acBase, dexModifier)
}

export * from './profile'
