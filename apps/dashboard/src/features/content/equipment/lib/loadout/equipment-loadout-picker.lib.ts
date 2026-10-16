import {
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  isEquipmentPickerSupportedKind,
  isWeaponEquipment,
  resolveEquipmentPresentationFacts,
  resolveWeaponCrossRecommendation,
  type CreatureWeaponProficiencyTarget,
  type Equipment,
  type EquipmentPickerItem,
  type WeaponInventoryEntry,
} from '@rpg/contracts'

export type BuildLoadoutEquipmentPickerItemsOptions = {
  resolveIsProficient?: (equipment: Equipment) => boolean
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

/** Stamps exact unowned weapon-proficiency matches onto loadout rows. Category grants stay browse context. */
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
