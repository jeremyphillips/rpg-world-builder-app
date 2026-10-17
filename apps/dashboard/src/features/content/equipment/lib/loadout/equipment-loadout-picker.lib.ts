import {
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  isEquipmentPickerSupportedKind,
  isWeaponEquipment,
  isWeaponProficientFromGrantSet,
  resolveEquipmentPresentationFacts,
  resolveWeaponCrossRecommendation,
  type CreatureWeaponProficiencies,
  type CreatureWeaponProficiencyTarget,
  type Equipment,
  type EquipmentPickerItem,
  type WeaponInventoryEntry,
} from '@rpg/contracts'

export type BuildLoadoutEquipmentPickerItemsOptions = {
  resolveIsProficient?: (equipment: Equipment) => boolean
}

/** Weapon rows use grant-set proficiency; non-weapons are always proficient in loadout UI. */
export function resolveLoadoutEquipmentIsProficient(
  equipment: Equipment,
  weaponGrants: CreatureWeaponProficiencies,
): boolean {
  if (!isWeaponEquipment(equipment)) return true
  return isWeaponProficientFromGrantSet(equipment, weaponGrants)
}

/** Minimal picker rows for loadout workflow (no purchase or proficiency gates). */
export function buildLoadoutEquipmentPickerItems(
  equipment: readonly Equipment[],
  options?: BuildLoadoutEquipmentPickerItemsOptions,
): EquipmentPickerItem[] {
  const resolveIsProficient = options?.resolveIsProficient ?? (() => true)
  return equipment
    .filter((row) => isEquipmentPickerSupportedKind(row.kind))
    .map((row) => ({
      equipment: row,
      state: {
        isAvailable: true,
        isRecommended: false,
        isProficient: resolveIsProficient(row),
        isWithinRemainingBudget: true,
        purchaseAvailability: { status: 'available' as const },
        recommendation: NEUTRAL_EQUIPMENT_RECOMMENDATION,
        disabledReasons: [],
      },
    }))
}

/**
 * Stamps exact unowned weapon-proficiency matches onto loadout picker rows.
 *
 * **Single dashboard implementation** for loadout `selectedWeaponProficiency` recommendation
 * stamping (compatible tier + presentation facts). Do not fork this envelope in feature
 * code — import this helper. Signal eligibility stays in
 * `@rpg/contracts` `resolveWeaponCrossRecommendation`; character-builder browse ranking
 * uses a separate contracts path. Category grants stay browse sort context only.
 */
export function applyLoadoutWeaponMatchSignals(args: {
  items: readonly EquipmentPickerItem[]
  targets: readonly CreatureWeaponProficiencyTarget[]
  inventory: readonly WeaponInventoryEntry[]
}): EquipmentPickerItem[] {
  return args.items.map((item) => {
    if (!isWeaponEquipment(item.equipment)) return item
    const signal = resolveWeaponCrossRecommendation({
      equipment: item.equipment,
      targets: args.targets,
      inventory: args.inventory,
    })
    if (signal?.kind !== 'equipment_match') return item

    const recommendation = {
      strength: 'compatible' as const,
      signals: [
        {
          strength: 'compatible' as const,
          basis: 'inferred' as const,
          specificity: 'exact' as const,
          reason: 'selectedWeaponProficiency' as const,
        },
      ],
    }
    const resolved = {
      requirements: [],
      recommendation,
      state: {},
    }
    return {
      ...item,
      state: {
        ...item.state,
        isRecommended: false,
        recommendation: {
          tier: 'compatible',
          reasons: ['selectedWeaponProficiency'],
          specificity: 'exact',
        },
        resolved: {
          ...resolved,
          presentation: resolveEquipmentPresentationFacts({
            resolved,
            equipment: item.equipment,
          }),
        },
      },
    }
  })
}
