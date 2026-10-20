import { formatWeaponDamage, type WeaponDamage } from '../../content/equipment/weapon-variant'
import type { WeaponProperty } from '../../vocab/weapon'
import type { Ability } from '../../vocab/ability'

import { formatSignedModifier } from '../../primitives/signed-modifier'

import { abilityModifier } from './ability-modifier'

export { formatSignedModifier } from '../../primitives/signed-modifier'

type WeaponAttackFields = {
  mode: 'melee' | 'ranged'
  properties: readonly WeaponProperty[]
}

/** Governing ability for a weapon attack when only one ability applies. */
export function resolveWeaponAttackAbility(
  weapon: WeaponAttackFields,
): Extract<Ability, 'str' | 'dex'> {
  return weapon.mode === 'ranged' ? 'dex' : 'str'
}

/**
 * Ability modifier used for attack and damage rolls.
 * Finesse melee weapons use the higher of STR and DEX when both scores exist.
 */
export function resolveWeaponAttackAbilityModifier(
  weapon: WeaponAttackFields,
  scores: Partial<Record<Ability, number>>,
): number | undefined {
  const strScore = scores.str
  const dexScore = scores.dex

  if (weapon.mode === 'ranged') {
    return typeof dexScore === 'number' ? abilityModifier(dexScore) : undefined
  }

  if (weapon.properties.includes('finesse')) {
    const strMod = typeof strScore === 'number' ? abilityModifier(strScore) : undefined
    const dexMod = typeof dexScore === 'number' ? abilityModifier(dexScore) : undefined
    if (strMod === undefined && dexMod === undefined) return undefined
    return Math.max(strMod ?? Number.NEGATIVE_INFINITY, dexMod ?? Number.NEGATIVE_INFINITY)
  }

  return typeof strScore === 'number' ? abilityModifier(strScore) : undefined
}

/** Weapon attack bonus: ability modifier plus proficiency when proficient. */
export function weaponAttackBonus(
  abilityModifierValue: number,
  isProficient: boolean,
  proficiencyBonus: number,
): number {
  return abilityModifierValue + (isProficient ? proficiencyBonus : 0)
}

/** Appends a signed ability modifier to catalog weapon damage dice. */
export function formatWeaponDamageWithModifier(
  damage: WeaponDamage,
  abilityModifierValue: number,
): string {
  return `${formatWeaponDamage(damage)} ${formatSignedModifier(abilityModifierValue)}`
}
