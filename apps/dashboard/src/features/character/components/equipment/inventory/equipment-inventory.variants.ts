import { cn, panelSectionInsetClasses } from '@rpg/ui'

/** Section inset inside the bleed inventory panel. The host does not pad again. */
export const equipmentInventorySectionClasses = cn(panelSectionInsetClasses, 'space-y-3')

export {
  EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT,
  equipmentInventoryRowListClasses,
  equipmentPurchasedInventoryCategoryClasses,
  equipmentPurchasedInventoryCategoryListClasses,
} from '@/lib/equipment/equipment-inventory-list.variants'

export const equipmentInventoryRowQuantityClasses = 'flex items-center gap-1.5'

export const equipmentInventoryRowActionsClasses = 'flex shrink-0 items-center'

/** Read-only quantity — 14px, matching the trailing price label. */
export const equipmentInventoryRowQtyLabelClasses = 'shrink-0 text-sm tabular-nums text-foreground'
