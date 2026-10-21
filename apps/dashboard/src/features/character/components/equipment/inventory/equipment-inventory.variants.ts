import { cn } from '@rpg/ui'

import { collectionPanelComfortableInsetClasses } from '@/lib/collection-panel/collection-panel-shell.variants'

/** Section inset inside the inventory collection host. */
export const equipmentInventorySectionClasses = cn(
  collectionPanelComfortableInsetClasses,
  'space-y-3',
)

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
