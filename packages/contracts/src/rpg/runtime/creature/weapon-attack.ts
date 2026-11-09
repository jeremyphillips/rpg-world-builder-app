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
 * Finesse uses the higher of Strength and Dexterity for melee and ranged weapons.
 * A thrown melee weapon keeps this modifier. Its catalog type does not become ranged.
 */
export function resolveWeaponAttackAbilityModifier(
  weapon: WeaponAttackFields,
  scores: Partial<Record<Ability, number>>,
): number | undefined {
  const strScore = scores.str
  const dexScore = scores.dex
  const strMod = typeof strScore === 'number' ? abilityModifier(strScore) : undefined
  const dexMod = typeof dexScore === 'number' ? abilityModifier(dexScore) : undefined

  if (weapon.properties.includes('finesse')) {
    if (strMod === undefined && dexMod === undefined) return undefined
    return Math.max(strMod ?? Number.NEGATIVE_INFINITY, dexMod ?? Number.NEGATIVE_INFINITY)
  }

  if (weapon.mode === 'ranged') return dexMod
  return strMod
}

/** Melee reach in feet. Reach weapons add 5 feet. Ranged weapons have no melee reach. */
export function resolveWeaponAttackReach(weapon: WeaponAttackFields): number | undefined {
  if (weapon.mode !== 'melee') return undefined
  return weapon.properties.includes('reach') ? 10 : 5
}

/** Attack modes a weapon permits. Thrown melee weapons can be used at range. */
export function resolveWeaponAttackModes(weapon: WeaponAttackFields): Array<'melee' | 'ranged'> {
  if (weapon.mode === 'ranged') return ['ranged']
  if (weapon.properties.includes('thrown')) return ['melee', 'ranged']
  return ['melee']
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
