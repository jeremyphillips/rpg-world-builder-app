import { abilityModifier } from './ability-modifier'

/** Save DC: 8 + proficiency bonus + ability modifier. */
export function abilitySaveDc(abilityScore: number, profBonus: number): number {
  return 8 + profBonus + abilityModifier(abilityScore)
}

/** Spell attack bonus: proficiency bonus + spellcasting ability modifier. */
export function spellAttackBonus(spellcastingAbilityScore: number, profBonus: number): number {
  return profBonus + abilityModifier(spellcastingAbilityScore)
}
