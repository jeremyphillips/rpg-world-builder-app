import { resolveCreatureArmorSlot, type CreatureArmorSlot } from '../equipment/armor-slot'

export const MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID = {
  duplicateBodyArmor: 'duplicate-body-armor',
  duplicateShield: 'duplicate-shield',
  invalidQuantity: 'invalid-quantity',
} as const

export type MonsterArmorOwnershipViolationId =
  (typeof MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID)[keyof typeof MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID]

export type MonsterArmorOwnershipViolation = {
  id: MonsterArmorOwnershipViolationId
  reason: 'duplicate-slot' | 'invalid-quantity'
  slot: CreatureArmorSlot
  entryIndex: number
}

type OwnershipEntry = {
  equipmentId?: string
  quantity?: number
}

type OwnershipCatalogItem = {
  kind: string
  category?: string
}

const DUPLICATE_ID: Record<CreatureArmorSlot, MonsterArmorOwnershipViolationId> = {
  'body-armor': MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.duplicateBodyArmor,
  shield: MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.duplicateShield,
}

/**
 * One owned body armor and one owned shield, each with quantity 1.
 * Equipped state is ignored. Missing catalog items are not violations:
 * the slot cannot be known, and unknown-equipment checks stay elsewhere.
 */
export function monsterArmorOwnershipViolations(
  equipment: readonly OwnershipEntry[],
  equipmentById: ReadonlyMap<string, OwnershipCatalogItem>,
): MonsterArmorOwnershipViolation[] {
  const violations: MonsterArmorOwnershipViolation[] = []
  const indexesBySlot: Record<CreatureArmorSlot, number[]> = {
    'body-armor': [],
    shield: [],
  }

  equipment.forEach((entry, entryIndex) => {
    if (!entry.equipmentId) return
    const item = equipmentById.get(entry.equipmentId)
    if (!item) return
    const slot = resolveCreatureArmorSlot(item)
    if (!slot) return
    if ((entry.quantity ?? 1) !== 1) {
      violations.push({
        id: MONSTER_ARMOR_OWNERSHIP_VIOLATION_ID.invalidQuantity,
        reason: 'invalid-quantity',
        slot,
        entryIndex,
      })
    }
    indexesBySlot[slot].push(entryIndex)
  })

  for (const slot of ['body-armor', 'shield'] as const) {
    for (const entryIndex of indexesBySlot[slot].slice(1)) {
      violations.push({
        id: DUPLICATE_ID[slot],
        reason: 'duplicate-slot',
        slot,
        entryIndex,
      })
    }
  }

  return violations
}
