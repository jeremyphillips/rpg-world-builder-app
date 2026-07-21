import {
  getMagicItemPickerActionRank,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type Equipment,
  type EquipmentPickerItem,
} from '@rpg/contracts'

import {
  resolveEquipmentAcquisitionContext,
  resolveEquipmentOwnedQuantity,
} from './equipment-step.lib'

function isMagicItemOutOfFocusedScope(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  focusedAllowanceId?: string
}): boolean {
  const { equipment, draft, focusedAllowanceId } = args
  if (!focusedAllowanceId) return false
  if (equipment.kind !== 'magic_item' || !equipment.rarity) return false

  const focusedRarity = focusedAllowanceId.split(':').at(-1)
  if (!focusedRarity || equipment.rarity === focusedRarity) return false

  return resolveEquipmentOwnedQuantity({ equipmentId: equipment.id, draft }) > 0
}

export function enrichEquipmentPickerItemsWithMagicItemAction(
  items: readonly EquipmentPickerItem[],
  args: {
    draft: CharacterBuilderDraft
    context: CharacterBuildContext
    catalogIndex: CharacterBuildCatalogIndex
    focusedAllowanceId?: string
  },
): EquipmentPickerItem[] {
  const acquisitionContext = resolveEquipmentAcquisitionContext({
    context: args.context,
    catalogIndex: args.catalogIndex,
  })

  return items.map((item) => {
    if (item.equipment.kind !== 'magic_item') return item

    const outOfFocusedScope = isMagicItemOutOfFocusedScope({
      equipment: item.equipment,
      draft: args.draft,
      focusedAllowanceId: args.focusedAllowanceId,
    })

    return {
      ...item,
      state: {
        ...item.state,
        magicItemAction: getMagicItemPickerActionRank({
          equipment: item.equipment,
          draft: args.draft,
          context: acquisitionContext,
          focusedAllowanceId: args.focusedAllowanceId,
          outOfFocusedScope,
        }),
      },
    }
  })
}
