import type { Equipment } from '../../content/equipment'
import { isWeaponEquipment } from '../../content/equipment'
import type { CreatureWeaponProficiencyTarget } from '../../content/creature'
import type { WeaponCategory } from '../../vocab/weapon/category'

import { isWeaponProficient } from './proficiencies'
import { toEquipmentContentId } from './equipment'

export const MATCHES_WEAPON_PROFICIENCY_LABEL = 'Matches weapon proficiency'
export const MATCHES_OWNED_WEAPON_LABEL = 'Matches owned weapon'
export const MATCHES_EQUIPPED_WEAPON_LABEL = 'Matches equipped weapon'

export type WeaponInventoryEntry = {
  equipmentId: string
  quantity: number
  equipped?: boolean
}

export type WeaponCrossRecommendation =
  | { kind: 'equipment_match'; specificity: 'exact' }
  | { kind: 'missing_proficiency'; possession: 'equipped' | 'owned' }

/** Same id, slug, and ruleset content-id match used by weapon proficiency checks. */
export function weaponReferenceMatchesEquipment(
  reference: string,
  weapon: Extract<Equipment, { kind: 'weapon' }>,
): boolean {
  return (
    reference === weapon.id ||
    reference === weapon.slug ||
    toEquipmentContentId(weapon.rulesetId, reference) === weapon.id
  )
}

function inventoryForWeapon(
  weapon: Extract<Equipment, { kind: 'weapon' }>,
  inventory: readonly WeaponInventoryEntry[],
): { owned: boolean; equipped: boolean } {
  let owned = false
  let equipped = false
  for (const entry of inventory) {
    if (entry.quantity <= 0) continue
    if (!weaponReferenceMatchesEquipment(entry.equipmentId, weapon)) continue
    owned = true
    if (entry.equipped === true) equipped = true
  }
  return { owned, equipped }
}

function hasSpecificProficiency(
  weapon: Extract<Equipment, { kind: 'weapon' }>,
  targets: readonly CreatureWeaponProficiencyTarget[],
): boolean {
  return targets.some(
    (entry) =>
      entry.weaponId !== undefined && weaponReferenceMatchesEquipment(entry.weaponId, weapon),
  )
}

/**
 * Exact equipment matches and missing specific proficiencies.
 * Category coverage is not a per-weapon signal. It suppresses missing-proficiency
 * through `isWeaponProficient` and is applied separately as browse order.
 */
export function resolveWeaponCrossRecommendation(args: {
  equipment: Equipment
  targets: readonly CreatureWeaponProficiencyTarget[]
  inventory: readonly WeaponInventoryEntry[]
}): WeaponCrossRecommendation | null {
  if (!isWeaponEquipment(args.equipment)) return null
  const weapon = args.equipment
  const { owned, equipped } = inventoryForWeapon(weapon, args.inventory)
  const proficient = isWeaponProficient(weapon, args.targets)

  if (!owned && hasSpecificProficiency(weapon, args.targets)) {
    return { kind: 'equipment_match', specificity: 'exact' }
  }
  if (owned && !proficient) {
    return { kind: 'missing_proficiency', possession: equipped ? 'equipped' : 'owned' }
  }
  return null
}

/** Category grants only. A specific weapon does not add its category. */
export function proficientWeaponCategories(
  targets: readonly CreatureWeaponProficiencyTarget[],
): WeaponCategory[] {
  const categories = new Set<WeaponCategory>()
  for (const target of targets) {
    if (target.weaponCategory !== undefined) categories.add(target.weaponCategory)
  }
  return [...categories].sort()
}
