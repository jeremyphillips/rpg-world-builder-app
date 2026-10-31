import { abilityModifier } from './ability-modifier'

/** Spell save DC: 8 + proficiency bonus + spellcasting ability modifier. */
export function spellSaveDc(spellcastingAbilityScore: number, profBonus: number): number {
  return 8 + profBonus + abilityModifier(spellcastingAbilityScore)
}

/** Spell attack bonus: proficiency bonus + spellcasting ability modifier. */
export function spellAttackBonus(spellcastingAbilityScore: number, profBonus: number): number {
  return profBonus + abilityModifier(spellcastingAbilityScore)
}
