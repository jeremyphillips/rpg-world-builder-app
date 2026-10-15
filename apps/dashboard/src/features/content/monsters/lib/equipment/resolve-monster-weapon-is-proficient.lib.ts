import {
  isWeaponEquipment,
  isWeaponProficientFromGrantSet,
  type CreatureWeaponProficiencies,
  type Equipment,
} from '@rpg/contracts'

/** Weapon rows only; non-weapons are always treated as proficient for loadout UI. */
export function resolveMonsterLoadoutEquipmentIsProficient(
  equipment: Equipment,
  weaponGrants: CreatureWeaponProficiencies,
): boolean {
  if (!isWeaponEquipment(equipment)) return true
  return isWeaponProficientFromGrantSet(equipment, weaponGrants)
}

export function resolveMonsterWeaponIsProficient(
  weapon: Extract<Equipment, { kind: 'weapon' }>,
  weaponGrants: CreatureWeaponProficiencies,
): boolean {
  return isWeaponProficientFromGrantSet(weapon, weaponGrants)
}
